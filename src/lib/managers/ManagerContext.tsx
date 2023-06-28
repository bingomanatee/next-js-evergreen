"use client"
import { createContext } from 'react'
import Manager from '~/lib/managers/Manager'
import { CanDI } from '@wonderlandlabs/can-di-land'
const ManagerContext = createContext<CanDI | null>(null);
export default ManagerContext;
