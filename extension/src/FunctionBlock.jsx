import { useMemo } from "react";
import { useState } from "react";

export const FunctionBlock = ({ code, name }) => {
  const [value, setValue] = useState(null);
  const [arg, setArg] = useState("");
  const [valid, setValid] = useState(false);

  useMemo(() => eval(code), [code]);

  const compute = () => {
    let a = arg;
    try {
      a = JSON.parse(a);
    } catch (err) {}

    try {
      setValue(window[name](a));
      setValid(true);
    } catch (err) {
      setValue("Error");
      setValid(false);
    }
  };

  const copy = () => navigator.clipboard.writeText(value);

  return (
    <div className="card border-secondary bg-dark">
      <header className="card-header pb-1 text-secondary">{name}</header>
      <div className="input-group px-2">
        <input
          type="text"
          placeholder="Argument..."
          value={arg}
          onChange={(ev) => setArg(ev.target.value)}
          className="form-control border-0 bg-black text-light"
        />
        <button className="btn btn-primary" onClick={compute}>
          Run
        </button>
      </div>
      <footer className="card-footer d-flex align-items-center">
        <span>Result:</span>
        <code className="ms-2">{String(value)}</code>
        {valid && (
          <button
            className="text-primary bg-transparent border-0 ms-auto"
            onClick={copy}
          >
            Copy
          </button>
        )}
      </footer>
    </div>
  );
};
