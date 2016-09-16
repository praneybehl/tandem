import { IObservable } from "tandem-common/observable";

export interface ITreeNode<T extends ITreeNode<any>> extends IObservable {
  children: Array<T>;
  nextSibling: T;
  previousSibling: T;
  appendChild(child: T);
  removeChild(child: T);
  insertChildAt(newChild: T, index: number);
  insertBefore(newChild: T, existingChild: T);
  depth: number;
  parent: T;
  ancestors: Array<T>;
  root: T;
  clone(): T;
}