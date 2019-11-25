import { useState, useEffect } from "react";

export default function useDebounce(input, ms, def = "") {
  const [debounced, setDebounced] = useState(def);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(input), ms);
    return () => clearTimeout(timeout);
  }, [input, ms]);

  return debounced;
}
