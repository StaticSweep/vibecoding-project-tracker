import { useEffect, useRef, useState } from 'react';

const resolve = (v) => (typeof v === 'function' ? v() : v);

/**
 * localStorage-backed state — survives reloads, no library needed.
 *
 * Usage:
 *   const [tasks, setTasks, notice] = useLocalStorage('vibetracker.tasks', seed, {
 *     normalise: (raw) => ({ ok, value, dropped }),
 *     fallback: [],
 *     onWriteError: (err) => toast(...),
 *   });
 *
 * - `initialValue` (value or function) is used only when the key is absent
 *   (FR-M4-05) — an empty array that was saved stays empty.
 * - `normalise` cleans data on load (FR-DATA-01). If the stored value is not
 *   valid JSON, or `normalise` returns `ok: false`, the raw string is copied to
 *   `<key>.backup` (DR-INT-01 / FR-DATA-03) and `fallback` is used instead.
 * - `notice` describes any repair made on load, so the UI can tell the user.
 * - `onWriteError` is called when a write fails, e.g. quota exceeded
 *   (NFR-REL-04, DR-CAP-03). The in-memory state is kept either way.
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const { normalise, fallback, onWriteError } = options;

  const [initial] = useState(() => readInitial(key, initialValue, normalise, fallback));
  const [value, setValue] = useState(initial.value);

  const onWriteErrorRef = useRef(onWriteError);
  onWriteErrorRef.current = onWriteError;

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      onWriteErrorRef.current?.(err);
    }
  }, [key, value]);

  return [value, setValue, initial.notice];
}

function readInitial(key, initialValue, normalise, fallback) {
  let raw;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    // Storage blocked (e.g. some private modes) — run in memory only.
    return { value: resolve(initialValue), notice: null };
  }

  if (raw == null) return { value: resolve(initialValue), notice: null };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return damaged(key, raw, fallback, initialValue);
  }

  if (!normalise) return { value: parsed, notice: null };

  const result = normalise(parsed);
  if (!result.ok) return damaged(key, raw, fallback, initialValue);

  if (result.dropped > 0) {
    backup(key, raw); // keep the original before the cleaned value overwrites it
    return { value: result.value, notice: { kind: 'damaged', dropped: result.dropped } };
  }

  return { value: result.value, notice: null };
}

function backup(key, raw) {
  try {
    window.localStorage.setItem(`${key}.backup`, raw);
  } catch {
    /* backup failed — nothing more we can do */
  }
}

function damaged(key, raw, fallback, initialValue) {
  backup(key, raw);
  const value = fallback !== undefined ? resolve(fallback) : resolve(initialValue);
  return { value, notice: { kind: 'damaged', dropped: 0 } };
}
