import ForgeUI, {
    Button,
    Form,
    Fragment,
    Link,
    Macro,
    Text,
    TextArea,
    TextField,
    render,
    useConfig,
    useProductContext,
    useState,
    Strong,
  } from "@forge/ui";
  import api, { route } from "@forge/api";
  
  const STATE = {
    INITIAL: 0,
    INPUT: 1,
    SUCCESS: 2,
  };
  
  type CreateIssueResponse = {
    key?: string;
    errorMessages: string[];
    errors?: Map<string, string>;
  };
  
  const App = () => {
    const { accountId } = useProductContext();
    const config = useConfig();
    const [state, setState] = useState(STATE.INITIAL);
    const [error, setError] = useState(null);
    const [issueKey, setIssueKey] = useState(null);
  
    if (!config) {
      return doNeedConfig();
    }
  
    switch (state) {
      case STATE.INITIAL:
        return doInitial();
      case STATE.INPUT:
        return doInput();
      case STATE.SUCCESS:
        return doSuccess();
    }
  
    function doNeedConfig() {
      return <Text>This app requires configuration before use.</Text>;
    }
  
    function doInitial() {
      return (
        <Fragment>
          <Button
            text="📣 Leave feedback on this page"
            onClick={() => {
              setState(STATE.INPUT);
            }}
          />
        </Fragment>
      );
    }
  
    function doInput() {
      return (
        <Fragment>
          <Form onSubmit={createIssue}>
            {error ? (
              <Text>
                <Strong> {`Error: ${error}`}</Strong>
              </Text>
            ) : (
              <Text>
                <Strong>Please complete the fields below:</Strong>
              </Text>
            )}
            <TextField label="Title" name="summary" isRequired={true} />
            <TextArea label="Description" name="description" />
          </Form>
        </Fragment>
      );
    }
  
    function doSuccess() {
      return (
        <Fragment>
          <Text>
            🙏{" "}
            <Strong>
              Created <Link href={`/browse/${issueKey}`}>{issueKey}</Link> Thanks
              for your feedback!
            </Strong>
          </Text>
          <Button
            text="📣 Leave more feedback"
            onClick={() => {
              setState(STATE.INPUT);
            }}
          />
        </Fragment>
      );
    }
  
    async function createIssue({ summary, description }) {
      setIssueKey(null);
      const payload: any = {
        update: {},
        fields: {
          project: {
            key: config.projectKey,
          },
          issuetype: {
            id: config.issueTypeId,
          },
          assignee: {
            id: config.assignee,
          },
          summary,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    text: description,
                    type: "text",
                  },
                ],
              },
            ],
          },
        },
      };
      // Only add the report if necessary since Jira's default setup omits the reporter field
      // from screens and will result in an error.
      if (config.reporter === "author") {
        payload.fields.reporter = {
          id: accountId,
        };
      }
      const response = await api.asApp().requestJira(route`/rest/api/3/issue`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const responseBody: CreateIssueResponse = await response.json();
      if (!response.ok) {
        console.error(responseBody);
        const firstErrorMessage = responseBody.errorMessages[0];
        let errorMessage = firstErrorMessage ? firstErrorMessage : "";
        if (responseBody.errors) {
          const messageSeparator = ". ";
          const additionalErrorText = Object.values(responseBody.errors).join(
            messageSeparator
          );
          if (additionalErrorText) {
            errorMessage = errorMessage
              ? errorMessage + messageSeparator + additionalErrorText
              : additionalErrorText;
          }
        }
        setError(errorMessage || "Failed to create issue.");
      } else {
        setError(null);
        setIssueKey(responseBody.key);
        setState(STATE.SUCCESS);
      }
    }
  };
  
  export const run = render(<Macro app={<App />} />);