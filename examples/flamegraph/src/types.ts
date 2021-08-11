export type SourceNode = {
  name: string;
  value: number;
  children?: SourceNode[];
};

export type ChartNode = {
  uid: string;
  backgroundColor: string;
  color: string;
  depth: number;
  left: number;
  name: string;
  tooltip?: string;
  width: number;
};

export type ChartData = {
  height: number;
  levels: string[][];
  nodes: { [uid: string]: ChartNode };
  root: string;
};
