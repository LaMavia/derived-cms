let str = React.string;

module Location = {
  [@bs.scope ("window", "location")] [@bs.val] external origin: string = "";
};

module Dealer = {
  let getData: unit => string =
    () => [%raw {|document.querySelector("input[type='hidden']").value|}];
};