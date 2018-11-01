# Rx MySQL

[![Build Status](https://travis-ci.com/ihoro/rough-rx-mysql.svg?branch=master)](https://travis-ci.com/ihoro/rough-rx-mysql)

Rough implementation of [rxified](https://npmjs.com/rxjs) wrapper of official [mysql](https://npmjs.com/mysql) lib.

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
