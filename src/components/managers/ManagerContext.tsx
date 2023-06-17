"use client"
import { createContext } from 'react'
import Manager from '~/components/managers/Manager'
const ManagerContext = createContext<Manager>(new Manager());
export default ManagerContext;
