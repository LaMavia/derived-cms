open PromiseMonad;
open Helpers;

/**
  Settings: [sort_by, primary_key, amount, page]
 */

type action =
  | Add(array(DerivedMap.t))
  | Replace(array(DerivedMap.t));

let fetchItems = (~dispatch, ~collection, ~min, ~max) => {
  Fetch.(
    fetch({j|/db_api/selected/$collection/?min=$min&max=$max|j})
    >>= Response.json
    >>= (res => res->JMySon.Decode.items_response->return)
    >>= (x => x.data->Add->dispatch->return)
    >>| (err => err->Js.Console.error->return)
  );
};

[@react.component]
let make = (~collection) => {
  let (items, dispatch) =
    React.useReducer(
      (oldItems, action) =>
        switch (action) {
        | Add(items) => Array.concat([items, oldItems])
        | Replace(items) => items
        | _ => oldItems
        },
      [||],
    );

  React.useEffect0(() => {
    ignore(fetchItems(~dispatch, ~collection, ~min=0, ~max=60));
    None;
  });
  <section className="content__items">
    {items
     ->Belt.Array.mapWithIndex((i, fields) =>
         <ul key={string_of_int(i)}>
           <br />
           {fields
            ->Belt.Array.mapWithIndex((i, (k, v)) =>
                <li key={string_of_int(i)}> {j|$k => $v|j}->str </li>
              )
            ->React.array}
         </ul>
       )
     ->React.array}
  </section>;
};