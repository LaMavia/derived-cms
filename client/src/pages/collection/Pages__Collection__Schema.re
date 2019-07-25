open PromiseMonad;
open Helpers;
open JMySon;
open Fetch;

module Field = {
  type action =
    | Rename(string)
    | Delete;

  [@react.component]
  let make = (~className="", ~onChange, ~onDelete, ~fieldKey, ~fieldType) => {
    let (value, set_val) = useState(fieldKey);

    <tr className="content__schema__fields__item">
      <td>
        <input
          type_="text"
          name=fieldKey
          id=fieldKey
          className="content__schema__fields__item__key"
          value
          onChange={e => e->ReactEvent.Form.currentTarget##value->set_val}
        />
      </td>
      <td className="content__schema__fields__item__value">
        fieldType->str
      </td>
      <td className="content__schema__fields__item__actions">
        <button
          className="content__schema__fields__item__actions__btn"
          onClick={e => {
            e->ReactEvent.Mouse.preventDefault;
            (fieldKey, value)->onChange;
          }}>
          "update"->str
        </button>
        <button
          className="content__schema__fields__item__actions__btn"
          onClick={e => {
            e->ReactEvent.Mouse.preventDefault;
            fieldKey->onDelete;
          }}>
          "delete"->str
        </button>
      </td>
    </tr>;
  };
};

type action =
  | Rename(string, string)
  | Delete(string)
  | Load(schema);

type queue =
  | Sending
  | Error(Js.Promise.error)
  | Free;

type addAction =
  | Name(string)
  | Type(string)
  | Clear;

let fetchSchema = (collection, dispatch, changeQueue) => {
  fetch({j|/collection/$(collection)/schema|j})
  >>= Response.json
  >>= (x => x->Decode.schema_response->return)
  >>= (
    res => {
      res.data->Load->dispatch;
      ()->return;
    }
  )
  >>| (
    err => {
      err->Error->changeQueue;
      err->Js.Console.error->return;
    }
  );
};

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
  >>= (_ => {
    ignore(fetchSchema(model, dispatch, changeQueue))
    return()
  })
  >>| (
    err => {
      err->Error->changeQueue;
      err->Js.Console.error->return;
    }
  );
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
  >>= (_ => {
    ignore(fetchSchema(model, dispatch, changeQueue))
    return()
  })
  >>| (
    err => {
      err->Error->changeQueue;
      err->Js.Console.error->return;
    }
  );
};

let addField = (model, dispatch, changeQueue, key, type_) => {
  changeQueue(Sending);
  fetchWithInit(
    {j|/db_api/$(model)/field/add/?key=$(key)&type=$(type_)|j},
    Fetch.RequestInit.make(~method_=Post, ()),
  )
  >>= Response.json
  >>= (
    _ => {
      changeQueue(Free);
      ignore(fetchSchema(model, dispatch, changeQueue));
      return();
    }
  )
  >>= (_ => {
    ignore(fetchSchema(model, dispatch, changeQueue))
    return()
  })
  >>| (
    err => {
      err->Error->changeQueue;
      err->Js.Console.error->return;
    }
  );
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

  let (addForm, dispatchAdd) =
    React.useReducer(
      (state, action: addAction) =>
        switch (action) {
        | Name(name) => [|name, state[1]|]
        | Type(t) => [|state[0], t|]
        | Clear => [|"", ""|]
        },
      [|"", ""|],
    );

  React.useEffect0(() => {
    ignore(fetchSchema(collection, dispatch, changeQueue));
    None;
  });

  let deleteField = deleteField(collection, dispatch, changeQueue);
  let renameField = renameField(collection, dispatch, changeQueue);
  let addField = addField(collection, dispatch, changeQueue);

  <section className="content__schema">
    <table className="content__schema__fields">
      <tbody>
        {fields
         ->Belt.Array.mapWithIndex((i, f) => {
             let (key, type_) = f;
             <Field
               fieldKey=key
               fieldType=type_
               key={i->string_of_int}
               onChange={((oldk, newk)) =>
                 if (oldk !== newk) {
                   ignore(
                     renameField(oldk, newk)
                     >>= (x => {x->Js.Console.log->return})
                     >>| (err => err->Js.Console.error->return),
                   );
                 }
               }
               onDelete={key =>
                 ignore(
                   key->deleteField
                   >>= (x => {x->Js.Console.log->return})
                   >>| (err => err->Js.Console.error->return),
                 )
               }
             />;
           })
         ->React.array}
        <tr className="content__schema__fields__item">
          <td>
            <input
              type_="text"
              name="__add"
              id="__add"
              className="content__schema__fields__item__key"
              value={Array.get(addForm, 0)}
              onChange={e =>
                e->ReactEvent.Form.currentTarget##value->Name->dispatchAdd
              }
            />
          </td>
          <td className="content__schema__fields__item__value">
            <select
              name="type_"
              id="type_"
              value={Array.get(addForm, 1)}
              onChange={e => {
                open ReactEvent.Form;
                e->preventDefault;
                e->currentTarget##value->Type->dispatchAdd;
              }}>
              {{[|"String", "Text", "ID", "Date", "Boolean", "Number"|]
                ->Belt.Array.mapWithIndex((i, t) =>
                    <option key={i->string_of_int} value=t> t->str </option>
                  )}
               ->React.array}
            </select>
          </td>
          <td className="content__schema__fields__item__actions">
            <button
              className="content__schema__fields__item__actions__btn"
              onClick={e => {
                e->ReactEvent.Mouse.preventDefault;
                ignore(addForm[0]->addField(addForm[1]));
              }}>
              "add"->str
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>;
};

/**
<select
          name="type" id="type" className="content__schema__add__field__input">
          {[|"ID", "String", "Text", "Date"|]
           ->Belt.Array.mapWithIndex((i, t) =>
               <option key={i->string_of_int} value=t> t->str </option>
             )
           ->React.array}
        </select> */;