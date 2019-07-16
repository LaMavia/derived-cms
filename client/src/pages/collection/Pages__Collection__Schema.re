open PromiseMonad;
open Helpers;
open JMySon;
open Fetch;

type action =
  | Rename(string, string)
  | Delete(string)
  | Load(schema);

type queue =
  | Sending
  | Error
  | Free;

/**
  {
    @Response
    data: {
      updateCount: int
    }
  }
 */
let deleteField = (model, dispatch, changeQueue, key) => {
  changeQueue(Sending);
  fetchWithInit(
    {j|/db_api/$(model)/field/delete/?key=$(key)|j},
    Fetch.RequestInit.make(~method_=Post, ()),
  )
  >>= Response.json
  >>= (
    _ => {
      changeQueue(Free);
      key->Delete->dispatch;
      return();
    }
  )
  >>| (err => err->Js.Console.error->return);
};

let renameField = (model, dispatch, changeQueue, oldk, newk) => {
  changeQueue(Sending);
  fetchWithInit(
    {j|/db_api/$(model)/field/rename/?oldk=$(oldk)&newk=$(newk)|j},
    Fetch.RequestInit.make(~method_=Post, ()),
  )
  >>= Response.json
  >>= (
    _ => {
      changeQueue(Free);
      Rename(oldk, newk)->dispatch;
      return();
    }
  )
  >>| (err => err->Js.Console.error->return);
};

[@react.component]
let make = (~collection) => {
  let (queue, changeQueue) = Helpers.useState(Free);
  let (fields, dispatch) =
    React.useReducer(
      (state: schema, action) =>
        switch (action) {
        | Rename(ok, nk) => state
        | Delete(k) => state
        | Load(s) => s
        },
      [||],
    );

  React.useEffect0(() => {
    ignore(
      fetch({j|/db_api/collection/$(collection)/schema|j})
      >>= Response.json
      >>= (
        x => {
          Js.Console.log(x);
          return(x);
        }
      )
      >>= (x => x->Decode.schema_response->return)
      >>= (
        res => {
          res.data->Load->dispatch;
          ()->return;
        }
      )
      >>| (err => err->Js.Console.error->return),
    );

    None;
  });

  let deleteField = deleteField(collection, dispatch, changeQueue);
  let renameField = renameField(collection, dispatch, changeQueue);

  <section className="content__schema">
    <ul className="content__schema__fields">
      {fields
       ->Belt.Array.mapWithIndex((i, f) => {
           let (key, type_) = f;
           <li
             className="content__schema__fields__item" key={i->string_of_int}>
             {j|$(key) : $(type_)|j}->str
           </li>;
         })
       ->React.array}
    </ul>
  </section>;
};