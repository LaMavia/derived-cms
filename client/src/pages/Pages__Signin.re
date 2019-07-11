open JMySon;

let textUnder = () =>
  <p className="auth__form__text">
    "Don't have an account yet?"->Helpers.str
    <br/>
    <a href="/auth/signup" className="auth__form__text__link">
      "Register here!"->Helpers.str
    </a>
  </p>;

[@react.component]
let make = () => {
  <AuthLayout
    title="signin"
    textUnder
    onSubmit={e => {
      let username: string = e->ReactEvent.Form.currentTarget##username##value;
      let password: string = e->ReactEvent.Form.currentTarget##password##value;

      ignore(
        Js.Promise.(
          (Helpers.Location.origin ++ "/auth/signin")
          ->Fetch.fetchWithInit(
              Fetch.RequestInit.make(
                ~method_=Post,
                ~body=
                  Encode.log_user(~username, ~password)
                  |> Json.stringify
                  |> Fetch.BodyInit.make,
                ~headers=
                  Fetch.HeadersInit.make({
                    "Content-Type": "application/json",
                  }),
                (),
              ),
            )
          |> then_(Fetch.Response.json)
          |> then_(x => x |> Decode.auth_response |> resolve)
          |> then_(r => {
               r |> Js.Console.log;
               ReasonReactRouter.push("/");
               r |> resolve;
             })
        ),
      );
      ();
    }}
    btnValue="Signin">
    <Form__Input
      name="username"
      label="username"
      type_="text"
      placeholder="username"
    />
    <Form__Input
      label="password"
      type_="password"
      placeholder="password"
      name="password"
    />
  </AuthLayout>;
};