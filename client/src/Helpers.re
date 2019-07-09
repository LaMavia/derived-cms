let str = React.string;
let useState = initial => {
  React.useReducer((_ignored, newState) => newState, initial);
};

[@bs.val] [@bs.scope ("window", "screen")] external width: int = "";
[@bs.val] [@bs.scope ("window", "screen")] external height: int = "";

module Location = {
  [@bs.scope ("window", "location")] [@bs.val] external origin: string = "";
};