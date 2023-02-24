import { useState } from 'react';

import {
  LoginButton,
  useSession,
} from "@inrupt/solid-ui-react";

import {
  addUrl,
  addStringNoLocale,
  createSolidDataset,
  createThing,
  getPodUrlAll,
  getSolidDataset,
  getThingAll,
  getStringNoLocale,
  removeThing,
  saveSolidDatasetAt,
  setThing,
  SolidDataset,
  getThing
} from "@inrupt/solid-client";

import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

export default function App() {
  const { session } = useSession();

  return (
    <>
      {!session.info.isLoggedIn && <Login />}
      <hr/>
      {session.info.isLoggedIn && <WriteToPod/>}
    </>
  );
}

function Login() {
  const identityProviders: string[] = ['https://solidcommunity.net/', 'https://login.inrupt.com/', 
    'https://inrupt.net/', 'https://solidweb.org/'];

  const { session } = useSession();
  const [selectedOption, setSelectedOption] = useState('Select an identity provider');
  const userIsLoggedIn = session.info.isLoggedIn;

  return (
    <>
      <div>
        <select 
        value={selectedOption}
        onChange={e => setSelectedOption(e.target.value)}
        >
          <option key="initialOption">
            Select an identity provider
          </option>
          {identityProviders.map((opt) => {
            return (
              <option key={opt}>
                {opt}
              </option>
            );
          })}
        </select>
        <LoginButton
          oidcIssuer={selectedOption}
          redirectUrl={window.location.href}
        >
          <button disabled={selectedOption === 'Select an identity provider'}>
            Log in
          </button>
        </LoginButton>
      </div>      
    </>
  );
}

function WriteToPod() {
  const { session } = useSession();

  const POD_URLS_INITIAL_VALUE = 'Choose a pod';

  const [podUrls, setPodUrls] = useState(Array<string>);

  const [selectedPodUrl, setSelectedPodUrl] = useState(POD_URLS_INITIAL_VALUE);

  const [textInput, setTextInput] = useState('');

  async function handleGetPodUrls() {
      const webID = session.info.webId;

      if (webID !== undefined) {
        const myPods = await getPodUrlAll(webID, { fetch: session.fetch });
        setPodUrls(myPods);   
      }
   
  }

  async function handleWrite() {
    const readingListUrl = `${selectedPodUrl}getting-started/note/myList`;
    let myReadingList: SolidDataset;

    try {
      // Attempt to retrieve the reading list in case it already exists.
      myReadingList = await getSolidDataset(readingListUrl, { fetch: session.fetch });
      // Clear the list to override the whole list
      let items = getThingAll(myReadingList);
      items.forEach((item) => {
        myReadingList = removeThing(myReadingList, item);
      });
    } catch (error) {
      if (typeof error.statusCode === "number" && error.statusCode === 404) {
        // if not found, create a new SolidDataset (i.e., the reading list)
        myReadingList = createSolidDataset();
      } else {
        console.error(error.message);
      }
    }

    let item = createThing({ name: "title" });
    item = addUrl(item, RDF.type, AS.Article);
    item = addStringNoLocale(item, SCHEMA_INRUPT.name, textInput);
    myReadingList = setThing(myReadingList, item);

    await saveSolidDatasetAt(
      readingListUrl,
      myReadingList,
      { fetch: session.fetch }
    );
  }

  return (
    <>
      <div>
        Your webID is: {session.info.webId}
      </div>
      <div>
        Create a private reading list in my Pod.
        <button onClick={handleGetPodUrls}>
          Get pod URL
        </button>
      </div>

      <div>
        a: Write to your Pod:
        <select 
          value={selectedPodUrl}
          onChange={(e) => setSelectedPodUrl(e.target.value)}  
        >
          <option>
            {POD_URLS_INITIAL_VALUE}
          </option>
          { podUrls.map(podUrl => {
              return (
                <option key={podUrl}>
                  {podUrl}
                </option>
              );
            })
          }
        </select>
      </div>
      <div>
        b: Enter items to write:
        <textarea  value={textInput} onChange={(e) => setTextInput(e.target.value)} />
        <button onClick={handleWrite}>
          Create
        </button>
      </div>
      <hr/>
      <ReadFromPod selectedPodUrl={selectedPodUrl}/>
    </>
  );
}

function ReadFromPod({ selectedPodUrl }) {
  const {session} = useSession();

  const readingListUrl = `${selectedPodUrl}getting-started/note/myList`;
  
  const [readInput, setReadInput] = useState('');

  async function handleRead() {
    const savedReadingList = await getSolidDataset(readingListUrl, { fetch: session.fetch });

    let item = getThing(savedReadingList, `${selectedPodUrl}getting-started/note/myList#title`);

    setReadInput(getStringNoLocale(item, SCHEMA_INRUPT.name));
  }

  return (
    <>
    <div>
      Retrieved to validate:
      <textarea readOnly value={readInput} />
      <button onClick={handleRead}>
        Read
      </button>
    </div>
    </>
  );
}
