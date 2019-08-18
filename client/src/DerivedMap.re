type t = array((string, string));

type set = (t, string, string) => t;
let set = (instance, key, value) =>
  instance->Belt.Array.map((k, v) =>
    if (k == key) {
      (k, value);
    } else {
      (k, v);
    }
  );

type get = (t, string) => option(string);
let get = (instance, key) =>
  instance->Belt.Array.getBy(((k, _)) => k == key);