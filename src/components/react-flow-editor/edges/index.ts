import { EdgeTypes } from 'reactflow';
import CustomEdge from './CustomEdge';

export const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

export { default as CustomEdge } from './CustomEdge';