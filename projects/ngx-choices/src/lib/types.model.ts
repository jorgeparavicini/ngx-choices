import { Choice } from 'choices.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AddItemData {
  id: number;
  value: string;
  label: string;
  customProperties: object;
  groupValue: any;
  keyCode: number;
}

export interface RemoveItemData {
  id: number;
  value: any;
  label: string;
  customProperties: object;
  groupValue: any;
}

export interface HighlightItemData {
  id: number;
  value: any;
  label: string;
  groupValue: any;
}

export interface UnhighlightItemData {
  id: number;
  value: any;
  label: string;
  groupValue: any;
}

export interface ChoiceData {
  choice: Choice;
}

export interface ChangeData {
  value: any;
}

export interface SearchData {
  value: string;
  resultCount: number;
}

export interface HighlightChoiceData {
  el: HTMLElement;
}
