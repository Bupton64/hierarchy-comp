export type Person = {
  gender: string;
  id: number;
  name: string;
};

export type NodeData = {
  id: string;
  person1: Person;
  person2?: Person;
  children?: number[];
};

export type RawTreeNode = {
  id: number;
  name: string;
  gender: string;
  children: number[];
  parents: number[];
};
