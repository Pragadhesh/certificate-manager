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
import { Certificate } from "crypto";
  const isValidDomain = require('is-valid-domain')

  const STATE = {
    TITLE: 0,
    CATEGORY: 1,
    INPUT: 2,
    VIEW_CERTS: 3,
    VIEW_REPORT: 4,
    VIEW_EXPIRING_CERTS_THIS_WEEK: 5,
    VIEW_EXPIRING_CERTS_THIS_MONTH: 6,
    VIEW_EXPIRING_CERTS_NEXT_MONTH: 7,
    VIEW_DELETE_CERT: 8,
    VIEW_UPDATE_CERT: 9,
    VIEW_UPDATE_SUCCESSFUL: 10,
    VIEW_ADD_SUCCESSFUL: 11
  };

  interface Certificates {
    name: string,
    issued_date: Date,
    expired_date: Date
  }

  const App = () => {
    const [state, setState] = useState(STATE.TITLE)
    const [error, setError] = useState(null);
    const [certificates,setCertificates] = useState<Certificates[]>([]);
    const [updatedcert, setUpdatedCert] = useState<{[key: string]: any}>({});

    let certificate_list : Array<Certificates> = [];
    let update_cert: Certificates = {
      name: "",
      issued_date: undefined,
      expired_date: undefined
    };

    useEffect(async () => {
      certificate_list = await storage.get("certificate_list")
      update_cert      = await storage.get("updated_cert")
      setCertificates(certificate_list)
      setUpdatedCert(update_cert)
    },[state]);

    switch (state) {
        case STATE.TITLE:
            return doTitle();
        case STATE.CATEGORY:
            return doCategory();
        case STATE.INPUT:
            return doInput();
        case STATE.VIEW_CERTS:
            return viewCerts();
        case STATE.VIEW_REPORT:
            return viewReport();
        case STATE.VIEW_EXPIRING_CERTS_THIS_WEEK:
            return viewExpiringCerts("week");
        case STATE.VIEW_EXPIRING_CERTS_THIS_MONTH:
            return viewExpiringCerts("month");
        case STATE.VIEW_EXPIRING_CERTS_NEXT_MONTH:
            return viewExpiringCerts("nextmonth");
        case STATE.VIEW_DELETE_CERT:
            return viewDeleteCert();
        case STATE.VIEW_UPDATE_CERT:
            return viewUpdateCert();
        case STATE.VIEW_UPDATE_SUCCESSFUL:
            return viewUpdateSuccessful();
        case STATE.VIEW_ADD_SUCCESSFUL:
            return viewAdditionSuccessful();
        }

    function viewExpiringCerts(expiration) {
      certificate_list = certificates
      if (expiration == "week")
      {
        var curr = new Date; // get current date
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        var last = first + 6; // last day is the first day + 6
        var startDate = new Date(curr.setDate(first));
        var endDate = new Date(curr.setDate(last));
        return(
        <Fragment>
          <Button
                text="< Back"
                onClick={() => {
                  setState(STATE.VIEW_REPORT);
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
            certificates.filter(
              function(certificate) {
                return new Date(certificate.expired_date) >= startDate && new Date(certificate.expired_date) <= endDate
              }
            ).map(certificate => 
              (
                <Row>
                  <Cell>
                    <Text>{certificate.name}</Text>
                  </Cell>
                  <Cell>
                    <Text>{new Date(certificate.issued_date).toLocaleDateString()}</Text>
                  </Cell>
                  <Cell>
                    <Text>{new Date(certificate.expired_date).toLocaleDateString()}</Text>
                  </Cell>
                </Row>
            ))
            }
            </Table>
        </Fragment>
      )
      }
      else if (expiration == "month")
      {
        var date = new Date();
        var startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        var endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return(
        <Fragment>
          <Button
                text="< Back"
                onClick={() => {
                  setState(STATE.VIEW_REPORT);
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
            certificates.filter(
              function(certificate) {
                return new Date(certificate.expired_date) >= startDate && new Date(certificate.expired_date) <= endDate
              }
            ).map(certificate => 
              (
                <Row>
                  <Cell>
                    <Text>{certificate.name}</Text>
                  </Cell>
                  <Cell>
                    <Text>{new Date(certificate.issued_date).toLocaleDateString()}</Text>
                  </Cell>
                  <Cell>
                    <Text>{new Date(certificate.expired_date).toLocaleDateString()}</Text>
                  </Cell>
                </Row>
            ))
            }
            </Table>
        </Fragment>
      )
      }
      else
      {
        var date = new Date();
        var startDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        var endDate = new Date(date.getFullYear(), date.getMonth() + 2, 0);
        return(
        <Fragment>
          <Button
                text="< Back"
                onClick={() => {
                  setState(STATE.VIEW_REPORT);
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
            certificates.filter(
              function(certificate) {
                return new Date(certificate.expired_date) >= startDate && new Date(certificate.expired_date) <= endDate
              }
            ).map(certificate => 
              (
                <Row>
                  <Cell>
                    <Text>{certificate.name}</Text>
                  </Cell>
                  <Cell>
                    <Text>{new Date(certificate.issued_date).toLocaleDateString()}</Text>
                  </Cell>
                  <Cell>
                    <Text>{new Date(certificate.expired_date).toLocaleDateString()}</Text>
                  </Cell>
                </Row>
            ))
            }
            </Table>
        </Fragment>
      )
      }
    }

    function viewUpdateCert() {
      return (
        <Fragment>
          <Button
                text="< Back"
                onClick={() => {
                  removeUpdateStatus();
                  setState(STATE.VIEW_CERTS);
                }}
          />
          <Form onSubmit={updateCertificate}>
                {error ? (
                    <Text>
                    <Strong> {`${error}`}</Strong>
                    </Text>
                ) : (
                    <Text>
                    <Strong>Please complete the fields below:</Strong>
                    </Text>
                )}      
                <TextField label="Certificate Name"  name="certificatename" defaultValue={updatedcert.name}   isRequired={true}  />
                <DatePicker label="Issued On" name="issuedon" defaultValue={updatedcert.issued_date.slice(0,10)} isRequired={true}/>
                <DatePicker label="Expires On" name="expireson" defaultValue={updatedcert.expired_date.slice(0,10)} isRequired={true}/>
          </Form>
        </Fragment>
      );

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
                text="Add New Certificate"
                onClick={() => {
                  setState(STATE.INPUT);
                }}
              />
              <Button
                text="View All Certificates"
                onClick={() => {
                  setState(STATE.VIEW_CERTS);
                }}
              />
              <Button
                text="Check Report"
                onClick={() => {
                  setState(STATE.VIEW_REPORT);
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
                    <Text>{new Date(certificate.issued_date).toLocaleDateString()}</Text>
                  </Cell>
                  <Cell>
                    <Text>{new Date(certificate.expired_date).toLocaleDateString()}</Text>
                  </Cell>
                  <Cell>
                    <ButtonSet>
                      <Button  onClick={() => {
                  setUpdateStatus(certificate.name);
                  setState(STATE.VIEW_UPDATE_CERT);
                      }}text="Update"/>
                <Button  onClick={() => {
                  deleteCertificate(certificate.name);
                  setState(STATE.VIEW_DELETE_CERT);
                }}text="Delete"/>
                </ButtonSet>
                  </Cell>
                </Row>
            ))
            }
            </Table>
        </Fragment>
      );
    }

    function viewReport()
    {
      return (
        <Fragment>
          <Button
                text="< Back"
                onClick={() => {
                  setState(STATE.CATEGORY);
                }}
          />
          <Text>
             <Strong>Certificates Expiring In</Strong>
          </Text>
          <ButtonSet>
              <Button
                text="This Week"
                onClick={() => {
                  setState(STATE.VIEW_EXPIRING_CERTS_THIS_WEEK);
                }}
              />
              <Button
                text="This Month"
                onClick={() => {
                  setState(STATE.VIEW_EXPIRING_CERTS_THIS_MONTH);
                }}
              />
              <Button
                text="Next Month"
                onClick={() => {
                  setState(STATE.VIEW_EXPIRING_CERTS_NEXT_MONTH);
                }}
              />
              </ButtonSet>
              <Button
                text="Generate Report"
                onClick={() => {
                  setState(STATE.VIEW_CERTS);
                }}
              />
          </Fragment>
      );
    }


    function viewDeleteCert()
    {
      return (
        <Fragment>
          <Button
                text="< Back"
                onClick={() => {
                  setState(STATE.CATEGORY);
                }}
          />
          <Text>
             <Strong>Certificate Deleted Successfully</Strong>
          </Text>
        </Fragment>
      );
    }

    function viewUpdateSuccessful()
    {
      return (
        <Fragment>
          <Button
                text="< Back"
                onClick={() => {
                  setState(STATE.VIEW_CERTS);
                }}
          />
          <Text>
             <Strong>Certificate Updated Successfully</Strong>
          </Text>
        </Fragment>
      );
    }

    function viewAdditionSuccessful()
    {
      return (
        <Fragment>
          <Button
                text="< Back"
                onClick={() => {
                  setState(STATE.VIEW_CERTS);
                }}
          />
          <Text>
             <Strong>Certificate Added Successfully</Strong>
          </Text>
        </Fragment>
      );
    }

    async function deleteCertificate(certname) {
      certificate_list = await storage.get("certificate_list")
      let final_list = certificate_list.filter(certificate => {
        return certificate.name !== certname;
      });
      storage.set("certificate_list",final_list)
    }

    async function setUpdateStatus(certificatename) {
      certificate_list = await storage.get("certificate_list")
      for(let i=0;i<certificate_list.length;i++)
      {
        if(certificate_list[i].name == certificatename)
        {
          update_cert.name = certificate_list[i].name
          update_cert.issued_date = certificate_list[i].issued_date
          update_cert.expired_date = certificate_list[i].expired_date
        }
      }
      storage.set("updated_cert",update_cert)
      storage.set("certificate_list",certificate_list)
    }

    async function removeUpdateStatus() {
      update_cert = null;
      storage.set("updated_cert",update_cert)
    }


    async function createCertificate({certificatename,issuedon,expireson}) {
        //const dateissued = new Date(issuedon)
        //const dateexpires = new Date(expireson)
        if (!isValidDomain(certificatename))
        {
            let errorMessage = "Please enter a valid name"
            setError(errorMessage)
        }
        else if (issuedon >= expireson)
        {
            let errorMessage = "Please enter valid dates"
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
            setError(errorMessage)
        }
        else if (issuedon >= expireson)
        {
            let errorMessage = "Please enter valid dates"
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
          setState(STATE.VIEW_ADD_SUCCESSFUL)
        }
      }

      async function updateCertificate({certificatename,issuedon,expireson}) {
        if (!isValidDomain(certificatename))
        {
            let errorMessage = "Please enter a valid name"
            setError(errorMessage)
        }
        else if (issuedon >= expireson)
        {
            let errorMessage = "Please enter valid dates"
            setError(errorMessage)
        }
        else {
          certificate_list = await storage.get("certificate_list")
          update_cert = await storage.get("updated_cert")
          for(let i=0;i<certificate_list.length;i++)
          {
            if(certificate_list[i].name == update_cert.name)
            {
              certificate_list[i].name = certificatename
              certificate_list[i].issued_date = issuedon 
              certificate_list[i].expired_date = expireson
            }
          }
          storage.set("certificate_list",certificate_list)
          setState(STATE.VIEW_UPDATE_SUCCESSFUL)
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