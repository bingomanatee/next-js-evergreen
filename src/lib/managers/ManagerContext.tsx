"use client"

import { createContext } from 'react'
const can = require('@wonderlandlabs/can-di-land/lib/index.js');
console.log('can is ', can);
const {CanDI} = can;
// import {
//   CanDI
// } from '@wonderlandlabs/can-di-land';

const mock = new CanDI();
const ManagerContext = createContext<CanDI>(mock);
export default ManagerContext;
