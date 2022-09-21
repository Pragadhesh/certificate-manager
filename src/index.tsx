import ForgeUI, {
    Button,
    Form,
    Fragment,
    Link,
    Macro,
    Text,
    DatePicker,
    TextField,
    render,
    useConfig,
    useProductContext,
    useState,
    Strong,
    ButtonSet,
  } from "@forge/ui";
  import api, { route } from "@forge/api";
  const isValidDomain = require('is-valid-domain')

  const STATE = {
    TITLE: 0,
    CATEGORY: 1,
    INPUT: 2,
    SUCCESS: 2,
  };
  
  const App = () => {
    const [state, setState] = useState(STATE.TITLE)
    const [error, setError] = useState(null);
    
    switch (state) {
        case STATE.TITLE:
            return doTitle();
        case STATE.CATEGORY:
            return doCategory();
        case STATE.INPUT:
            return doInput();
        }

    function doTitle() {
        return (
          <Fragment>
            <Button
              text="📣 Certificate Manager"
              onClick={() => {
                setState(STATE.CATEGORY);
              }}
            />
          </Fragment>
        );
      }

    function doCategory() {
        return (
            <Fragment>
                <ButtonSet>
                <Button
                text="Check Status"
                onClick={() => {
                  setState(STATE.INPUT);
                }}
              />
              <Button
                text="Add New Certificate"
                onClick={() => {
                  setState(STATE.INPUT);
                }}
              />
              </ButtonSet>
            </Fragment>
          );
    }

    async function createCertificate({certificatename,issuedon,expireson}) {
        //const dateissued = new Date(issuedon)
        //const dateexpires = new Date(expireson)
        if (!isValidDomain(certificatename))
        {
            let errorMessage = "Please enter a valid name"
            console.log(errorMessage)
            setError(errorMessage)
        }
        else if (issuedon >= expireson)
        {
            let errorMessage = "Please enter valid dates"
            console.log(errorMessage)
            setError(errorMessage)
        }
        else
        {
            setError(null)
        }
      };

    function doInput() {
        return (
            <Fragment>
                <Button
                text="< Back"
                onClick={() => {
                  setState(STATE.CATEGORY);
                }}
                />
                <Form onSubmit={createCertificate}>
                {error ? (
                    <Text>
                    <Strong> {`${error}`}</Strong>
                    </Text>
                ) : (
                    <Text>
                    <Strong>Please complete the fields below:</Strong>
                    </Text>
                )}
                <TextField label="Certificate Name" name="certificatename" isRequired={true} />
                <DatePicker label="Issued On" name="issuedon" isRequired={true}/>
                <DatePicker label="Expires On" name="expireson" isRequired={true}/>
                </Form>
            </Fragment>
                );
    }
  };
  
  export const run = render(<Macro app={<App />} />);