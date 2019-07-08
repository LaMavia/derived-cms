let str = React.string;
let useState = initial => {
  React.useReducer((_ignored, newState) => newState, initial);
};

module Location = {
  [@bs.scope ("window", "location")] [@bs.val] external origin: string = "";
};
