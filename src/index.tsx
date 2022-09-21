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
  } from "@forge/ui";
  import api, { route } from "@forge/api";

  const STATE = {
    TITLE: 0,
    INPUT: 1,
    SUCCESS: 2,
  };
  
  const App = () => {
    const [state, setState] = useState(STATE.TITLE)
    
    switch (state) {
        case STATE.TITLE:
            return doTitle();
        case STATE.INPUT:
            return doInput();
        }

    function doTitle() {
        return (
          <Fragment>
            <Button
              text="📣 Add Certificates"
              onClick={() => {
                setState(STATE.INPUT);
              }}
            />
          </Fragment>
        );
      }

      async function onSubmit(formData) {
        /**
         * formData:
         * {
         *    username: 'Username',
         *    products: ['jira']
         * }
         */
        console.log(formData)
      };

    function doInput() {
        return (
            <Fragment>
                <Form onSubmit={onSubmit}>
                <TextField label="Certificate Name" name="certificate-name" isRequired={true} />
                <DatePicker label="Issued On" name="issued-on" isRequired={true}/>
                <DatePicker label="Expires On" name="expires-on" isRequired={true}/>
                </Form>
            </Fragment>
                );
    }



    async function createCertificate(params:string) {
        console.log("Reached function")
    }
  };
  
  export const run = render(<Macro app={<App />} />);