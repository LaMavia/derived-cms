let str = React.string;

module Location = {
  [@bs.scope ("window", "location")] [@bs.val] external origin: string = "";
};

let useState = initial => {
  React.useReducer((_ignored, newState) => newState, initial);
};