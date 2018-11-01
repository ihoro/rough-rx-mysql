# Rx MySQL

[![Build Status](https://travis-ci.com/ihoro/rough-rx-mysql.svg?branch=master)](https://travis-ci.com/ihoro/rough-rx-mysql)

Rough implementation of [rxified](https://npmjs.com/rxjs) wrapper of [mysql](https://npmjs.com/mysql) lib.

## Getting started

Installation
```
$ npm i mysql @rough/rx-mysql
```

A simple query
```js
const { finalize } = require('rxjs/operators');
const { createPool } = require('mysql');
const RxMySQL = require('@rough/rx-mysql');

const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'myproject'
});

const rxsql = new RxMySQL(pool);

rxsql
  .query('select * from users')
  .pipe(finalize(_ => pool.end()))
  .subscribe(result => console.log(result));
```

A simple transaction
```js
rxsql
  .transaction(
    (rxsql, prevResult) => rxsql.query('select * from users where id = ? for update', 42),
    (rxsql, prevResult) => rxsql.query('delete from deals where user_scope_id = ?', prevResult[0].user_scope_id),
    (rxsql, prevResult) => rxsql.query('delete from inventory where user_id = ?', 42),
  )
  .pipe(finalize(_ => pool.end()))
  .subscribe(result => console.log(result));
```
