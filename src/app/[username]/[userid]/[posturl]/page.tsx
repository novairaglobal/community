'use client';

import Home from '../../../page';

export default function PostDeepLink() {
  // This ensures that if someone directly visits a shared link like:
  // https://community.novairasolution.com/john-doe/uid123/postHashABC
  // It won't 404, but will load the main community app.
  // Future update: The Home component can read the params and auto-open the modal!
  return <Home />;
}
