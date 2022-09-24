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
    Table,
    Cell,
    Head,
    Row,
    useEffect,
  } from "@forge/ui";
  import api, { route } from "@forge/api";
  import { storage } from '@forge/api';
  const isValidDomain = require('is-valid-domain')

  const STATE = {
    TITLE: 0,
    CATEGORY: 1,
    INPUT: 2,
    VIEW_CERTS: 3
  };

  interface Certificates {
    name: string,
    issued_date: Date,
    expired_date: Date,
  }

  const App = () => {
    const [state, setState] = useState(STATE.TITLE)
    const [error, setError] = useState(null);
    const [certificates,setCertificates] = useState([]);
    let certificate_list : Array<Certificates> = [];

    useEffect(async () => {
      console.log("entered use effect");
      certificate_list = await storage.get("certificate_list")
      setCertificates(certificate_list)
      console.log(certificates)
    },[]);

    switch (state) {
        case STATE.TITLE:
            return doTitle();
        case STATE.CATEGORY:
            return doCategory();
        case STATE.INPUT:
            return doInput();
        case STATE.VIEW_CERTS:
            return viewCerts();
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
              <Button
                text="View Existing Certificates"
                onClick={() => {
                  setState(STATE.VIEW_CERTS);
                }}
              />
              </ButtonSet>
            </Fragment>
          );
    }

    function viewCerts()
    {
      return (
        <Fragment>
          <Button
                text="< Back"
                onClick={() => {
                  setState(STATE.CATEGORY);
                }}
          />
          <Table>
            <Head>
              <Cell>
                <Text>Certificate Name</Text>
              </Cell>
              <Cell>
                <Text>Issued On</Text>
              </Cell>
              <Cell>
                <Text>Expires On</Text>
              </Cell>
            </Head>
          {
            certificates.map(certificate => 
              (
                <Row>
                  <Cell>
                    <Text>{certificate.name}</Text>
                  </Cell>
                  <Cell>
                    <Text>{certificate.issued_date}</Text>
                  </Cell>
                  <Cell>
                    <Text>{certificate.expired_date}</Text>
                  </Cell>
                </Row>
            ))
            }
            </Table>
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
            let space_id
            if(checkspace.status != 200)
            {
                var bodyData = `{
                    "key": "certificatemanager",
                    "name": "Certificate Manager"
                  }`;
                const createspaceresponse = await api.asApp().requestConfluence(route`/wiki/rest/api/space`, {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                    body: bodyData
                })
                .then(response =>
                  response.json().then(data=>
                    {
                      space_id = data.id
                    })
                )
                .catch(err =>
                {
                  console.log(err)
                }
                )
                // Create Initial certificate
                const itvalues =  '<table data-layout="default"><colgroup><col style="width: 226.67px;" /><col style="width: 226.67px;" /><col style="width: 226.67px;" /></colgroup><tbody><tr><th><p><strong>Certificate Name</strong></p></th><th><p><strong>Issued On</strong></p></th><th><p><strong>Expires On</strong></p></th></tr>'
                let headers = itvalues.replace(/"/g, '\'')
                let newcertificate = '<tr><td><p>'+certificatename+'</p></td><td><p>'+issuedon+'</p></td><td><p>'+expireson+'</p></td></tr></tbody></table>'
                let tablebody = '"'+headers+newcertificate+'"'
                var bodyData = `{
                  "title": "Certificate Details",
                  "type": "page",
                  "space": {
                    "id": ${space_id},
                    "name": "Certificate Manager"
                  },
                  "body": {
                    "storage": {
                      "value": ${tablebody},
                      "representation": "storage"
                    }
                  }
                }`;
                const tableinit = await api.asApp().requestConfluence(route`/wiki/rest/api/content`, {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: bodyData
                });
            }
            else
            {
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
            let tablebody = '"'+headers+newcertificate+'"'
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
          }
            setError(null)
        }
      };

      async function addCertificate({certificatename,issuedon,expireson}) {
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
        else {
          certificate_list = await storage.get("certificate_list")
          certificate_list.push({
            name: certificatename,
            issued_date: new Date(issuedon),
            expired_date: new Date(expireson)
          })
          storage.set("certificate_list",certificate_list)
          console.log(certificate_list)
        }
      }

    function doInput() {
        return (
            <Fragment>
                <Button
                text="< Back"
                onClick={() => {
                  setState(STATE.CATEGORY);
                }}
                />
                <Form onSubmit={addCertificate}>
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