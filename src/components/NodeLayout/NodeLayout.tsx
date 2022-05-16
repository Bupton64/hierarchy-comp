import React from "react";
import { RawTreeNode } from "../../types";

import "./nodeLayout.css";

type NodeLayoutProps = {
  person1: RawTreeNode;
  person2?: RawTreeNode;
};

type PersonLayoutProps = {
  person: RawTreeNode;
};

const PersonLayout = (props: PersonLayoutProps) => {
  return (
    <div
      title={props.person.name}
      className={
        props.person.gender === "male" ? "person male" : "person female"
      }
    >
      {props.person.name}
    </div>
  );
};

const NodeLayout = (props: NodeLayoutProps) => {
  return (
    <>
      <PersonLayout person={props.person1} />
      {props.person2 && <PersonLayout person={props.person2} />}
    </>
  );
};

export default NodeLayout;
