type url = {
  path: list(string),
  hash: string,
  search: string,
};

let is_signedin = (url: ReasonReactRouter.url) => {
  switch (url.path->Belt.List.head) {
  | Some(h) => h !== "auth"
  | None => true
  };
};

[@react.component]
let make = () => {
  let url = ReasonReactRouter.useUrl();
  let renderNav = is_signedin(url);

  <Layout renderNav>
    {switch (url.path) {
     | [] => <Pages__Index />
     | ["auth", "signin"] => <Pages__Signin />
     | ["auth", "signup"] => <Pages__Signup />
     | ["collection", collection, "overview"] =>
       <Pages__Collection__Overview collection />
     | ["collection", collection, "schema", "edit"] =>
       <Pages__Collection__Schema collection />
     | _ => <Pages__404 path={url.path} />
     }}
  </Layout>;
};