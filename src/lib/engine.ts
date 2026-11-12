import type { Attempt, Discovery, VocabEntry } from '../types';
import { LEARNING } from '../config/learning';
import * as engine from './engine.mjs';
export const normalizedAnswer = engine.normalizedAnswer as (value: string) => string;
export const isWrittenCorrect = engine.isWrittenCorrect as (answer: string, entry: VocabEntry) => boolean;
export const stateFor = (id: string, discovered: Discovery[], attempts: Attempt[]) => engine.stateFor(id, discovered, attempts, LEARNING);
export const nextDueAt = (id: string, discovered: Discovery[], attempts: Attempt[]) => engine.nextDueAt(id, discovered, attempts, LEARNING) as number | null;
export const orderEntries = (entries: VocabEntry[], mode: 'random' | 'alphabetical' | 'failed' | 'due' | 'failed-due', attempts: Attempt[], discoveries: Discovery[]) => engine.orderEntries(entries, mode, attempts, discoveries) as VocabEntry[];
