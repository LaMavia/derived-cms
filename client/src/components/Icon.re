let burger = [%raw {|require("@public/svg/burger.svg")|}];
let id = [%raw {|require("@public/svg/id-card.svg")|}];

type name = [ | `burger | `id];

[@react.component]
let make = (~name) => {
  let logo =
    switch (name) {
    | `burger => burger
    | `id => id
    };
  <div dangerouslySetInnerHTML={"__html": logo} />;
};