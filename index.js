'use strict';

const { Observable } = require('rxjs');
const { map, flatMap, tap, count, catchError } = require('rxjs/operators');

module.exports = class RxMysql {
  constructor(pool) {
    this.pool = pool;
  }

  query(sql, params) {
    return Observable.create(observer => {
      function mysqlCallback(err, result) {
        if (err)
          observer.error(err);
        else
          observer.next(result);
        observer.complete();
      }
      if (params)
        this.pool.query(sql, params, mysqlCallback);
      else
        this.pool.query(sql, mysqlCallback);
    });
  }

  transaction(...queryFunctions) {
    let connection = null;
    let rxmysql = null;
    return this.getConnection().pipe(
      tap(_connection => connection = _connection),
      map(connection => new RxMysql(connection)),
      tap(_rxmysql => rxmysql = _rxmysql),
      flatMap(_ => rxmysql.query('START TRANSACTION')),
      ...queryFunctions.map(query => flatMap(prevResult => query(rxmysql, prevResult))),
      count(),
      flatMap(_ => rxmysql.query('COMMIT')),
      catchError(err => {
        return rxmysql.query('ROLLBACK').pipe(
          tap(_ => connection.release()),
          tap(_ => { throw err; })
        );
      }),
      tap(_ => connection.release())
    );
  }

  getConnection() {
    return Observable.create(observer => {
      this.pool.getConnection((err, connection) => {
        if (err)
          observer.error(err);
        else
          observer.next(connection);
        observer.complete();
      });
    });
  }
};
