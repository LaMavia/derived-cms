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

    <li className="content__schema__fields__item">
      <input
        type_="text"
        name=fieldKey
        id=fieldKey
        className="content__schema__fields__item__key"
        value
        onChange={e => e->ReactEvent.Form.currentTarget##value->set_val}
      />
      <p className="content__schema__fields__item__value"> fieldType->str </p>
      <div className="content__schema__fields__item__actions">
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
      </div>
    </li>;
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

  React.useEffect0(() => {
    ignore(
      fetch({j|/db_api/collection/$(collection)/schema|j})
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
      ),
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
    </ul>
    <div className="content__schema__add">
      <div className="content__schema__add__field">
        <label htmlFor="" className="content__schema__add__field__label">
          "field's name"->str
        </label>
        <input type_="text" className="content__schema__add__field__input" />
      </div>
      <div className="content__schema__add__field">
        <label htmlFor="" className="content__schema__add__field__label">
          "field's type"->str
        </label>
        <select
          name="type" id="type" className="content__schema__add__field__input">
          {[|"ID", "String", "Text", "Date"|]
           ->Belt.Array.mapWithIndex((i, t) =>
               <option key={i->string_of_int} value=t> t->str </option>
             )
           ->React.array}
        </select>
      </div>
      <button className="content__schema__add__btn"> "add"->str </button>
    </div>
  </section>;
};