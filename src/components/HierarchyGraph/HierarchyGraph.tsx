import React, { useEffect } from "react";
import dagre from "dagre";
import ReactFlow, {
  ConnectionLineType,
  Edge,
  Node,
  Position,
  useEdgesState,
  useNodesState
} from "react-flow-renderer";
import "./hierarchyGraph.css";
import NodeLayout from "../NodeLayout/NodeLayout";
import { NodeData, RawTreeNode } from "../../types";

type HierarchyGraphProps = {
  data: RawTreeNode[];
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 200;
const NODE_HEIGHT = 200;
const terminalPosition = { x: 0, y: 0 };

/* Layouting example provided by React Flow documentation
 *  found here: https://reactflow.dev/docs/examples/layout/dagre/
 */
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: "TB" });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2
    };

    return node;
  });

  return { nodes, edges };
};

const HierarchyGraph = (props: HierarchyGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const getNodes = (
    remainingElements: RawTreeNode[],
    graphNodes: Node[]
  ): Node[] => {
    // termination clause
    if (remainingElements.length === 0) {
      return graphNodes;
    }

    //get first part of pair,
    const first = remainingElements[0];
    remainingElements.splice(0, 1);

    const second = remainingElements.find(x =>
      x.children.some(y => first.children.includes(y))
    );

    if (second) {
      const secondIndex = remainingElements.indexOf(second);
      remainingElements.splice(secondIndex, 1);
    }

    // Now create the graph node
    const newNode: Node = {
      id: `#${first.id}##${second ? second.id : ""}#`,
      position: terminalPosition,
      // some logic to control where dots appear
      type:
        first.parents.length === 0 && second?.parents.length === 0
          ? "input"
          : first.children.length === 0
          ? "output"
          : "default",
      data: {
        label: <NodeLayout person1={first} person2={second} />,
        // Using a delimited #id# to make searching for one parent within a joint node possible
        id: `#${first.id}##${second ? second.id : ""}#`,
        person1: {
          gender: first.gender,
          name: first.name,
          id: first.id
        },
        person2: second
          ? {
              gender: second.gender,
              name: second.name,
              id: second.id
            }
          : undefined,
        children: first.children
      }
    };

    return getNodes(remainingElements, [...graphNodes, newNode]);
  };

  const getEdges = (nodes: Node<NodeData>[]) => {
    const edges: Edge[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const parent = nodes[i];
      // For each child, establish an edge link to the childs NODE (remembering that a node is a joint entity)
      if (parent.data.children) {
        for (let j = 0; j < parent.data.children?.length; j++) {
          const idToSearch = parent.data.children[j];
          const childNode = nodes.find(x => x.id.includes(`#${idToSearch}#`));

          if (childNode) {
            edges.push({
              id: `e_${parent.id}_${childNode.id}`,
              source: parent.id,
              target: childNode.id,
              type: "smoothstep"
            });
          }
        }
      }
    }

    return edges;
  };

  // When the data changes, convert to our graph data structure which pairs the parents as a single entity
  useEffect(() => {
    const newNodes = props.data.slice(); // slice to make a copy
    const graphNodes: Node[] = getNodes(newNodes, []);
    const graphEdges: Edge[] = getEdges(graphNodes);

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      graphNodes,
      graphEdges
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [props.data]);

  return (
    <div className="layoutflow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={false}
        nodesConnectable={false}
        deleteKeyCode={null}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      />
    </div>
  );
};

export default HierarchyGraph;
