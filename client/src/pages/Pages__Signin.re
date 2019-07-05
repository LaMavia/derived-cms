type response = {
  token: string,
  username: string,
};

type user = {
  username: string,
  password: string,
};

module Decode = {
  let response = json =>
    Json.Decode.{
      token: json |> field("token", string),
      username: json |> field("username", string),
    };
};

module Encode = {
  let user = (~username, ~password) =>
    Json.Encode.(
      object_([
        ("username", username |> string),
        ("password", password |> string),
      ])
    );
};

[@react.component]
let make = () => {
  <AuthLayout
    title="signin"
    onSubmit={e => {
      let username: string = e->ReactEvent.Form.currentTarget##username##value;
      let password: string = e->ReactEvent.Form.currentTarget##password##value;

      Js.Promise.(
        (Helpers.Location.origin ++ "/auth/signup")
        ->Fetch.fetchWithInit(
            Fetch.RequestInit.make(
              ~method_=Post,
              ~body=
                Encode.user(~username, ~password)
                |> Json.stringify
                |> Fetch.BodyInit.make,
              (),
            ),
          )
        |> then_(Fetch.Response.json)
      );
      ();
    }}
    btnValue="Signin">
    <input
      className="auth__form__input"
      type_="text"
      placeholder="username"
      name="username"
      id="username"
    />
    <input
      className="auth__form__input"
      type_="password"
      placeholder="password"
      name="password"
      id="password"
    />
  </AuthLayout>;
};