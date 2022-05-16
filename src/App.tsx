import React from "react";
import "./App.css";
import HierarchyGraph from "./components/HierarchyGraph/HierarchyGraph";
import familyTree from "./data/sampleData";

function App() {
  return (
    <div className="App">
      <HierarchyGraph data={familyTree} />
    </div>
  );
}

export default App;
