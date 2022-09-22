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
            const checkspace = await api.asApp().requestConfluence(route`/wiki/rest/api/space/certificatemanager`, {
                headers: {
                  'Accept': 'application/json'
                }
              });
            if(checkspace.status != 200)
            {
                var bodyData = `{
                    "key": "certificatemanager",
                    "name": "Certificate Manager"
                  }`;
                const response = await api.asApp().requestConfluence(route`/wiki/rest/api/space`, {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                    body: bodyData
                });
                response.text().then(function (text) {
                    console.log(text)
                  });

            }
            let contentid;
            let tablevalues;
            let current_version;
            const contentdetails = await api.asApp().requestConfluence(route`/wiki/rest/api/space/certificatemanager/content`, {
              headers: {
                'Accept': 'application/json'
              }})
              .then(response =>
                response.json().then(data=>
                  {
                    for (var key in data.page.results) {
                      var page_details = data.page.results[key]
                      if(page_details.title == "Certificate Details")
                      {
                        contentid = page_details.id
                      }
                    }

                  })
              )
              .catch(err =>
              {
                console.log(err)
              }
              )
            console.log(contentid)
            const pagedetails = await api.asApp().requestConfluence(route`/wiki/rest/api/content/${contentid}?expand=body.storage,version`, {
              headers: {
                'Accept': 'application/json'
              }
            })
            .then(response =>
              response.json().then(data=>
                {
                  tablevalues = data.body.storage.value
                  current_version = data.version.number
                })
            )
            .catch(err =>
            {
              console.log(err)
            }
            )
            let tvalues = tablevalues.split('</tbody></table>')
            let newcertificate = '<tr><td><p>'+certificatename+'</p></td><td><p>'+issuedon+'</p></td><td><p>'+expireson+'</p></td></tr></tbody></table>'
            let headers = tvalues[0].replace(/"/g, '\'')
            console.log("THis is new certificate")
            console.log(newcertificate)
            let tablebody = '"'+headers+newcertificate+'"'
            console.log(tablebody)
            var bodyData = `{
              "version": {
                "number": ${current_version+1}
              },
              "title": "Certificate Details",
              "type": "page",
              "body": {
                "storage": {
                  "value": ${tablebody},
                  "representation": "storage"
                }
              }
            }`;
            const response = await api.asApp().requestConfluence(route`/wiki/rest/api/content/${contentid}`, {
              method: 'PUT',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: bodyData
            });
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