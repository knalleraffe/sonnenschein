import { createContext } from 'react'

/**
  Wie Karten-Sheets hereinkommen: 'feder' (Standard, leichtes Nachschwingen)
  oder 'ruhig' (ohne Überschwingen — Himmelsroute, Master Abschnitt 7).
*/
export const SheetBewegung = createContext<'feder' | 'ruhig'>('feder')
