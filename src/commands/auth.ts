import { Issuer, errors } from 'openid-client';
import open from 'open';
import prompts from 'prompts';

const handler = async (): Promise<void> => {
  const ISSUER = 'ISSUER';

  async function loginProcessor() {
    const issuer = await Issuer.discover(ISSUER);

    const client = new issuer.Client({
      client_id: 'CLIENT_ID',
      token_endpoint_auth_method: 'none',
      id_token_signed_response_alg: 'RS256',
    });

    const handle = await client.deviceAuthorization({
      scope: 'profile',
      audience: 'AUDIENCE',
    });

    const { verification_uri_complete, user_code, expires_in } = handle;

    // User Interaction - https://tools.ietf.org/html/rfc8628#section-3.3
    await prompts({
      type: 'invisible',
      name: 'open browser',
      message: `Press any key to open up the browser to login or press ctrl-c to abort. You should see the following code: ${user_code}. It expires in ${
        expires_in % 60 === 0
          ? `${expires_in / 60} minutes`
          : `${expires_in} seconds`
      }.`,
    });
    // opens the verification_uri_complete URL using the system-register handler for web links (browser)
    open(verification_uri_complete).catch((e) => console.error(e));

    let tokens;
    try {
      tokens = await handle.poll();
    } catch (err) {
      const { error, error_description } = err as {
        error: string;
        error_description: string;
      };

      switch (error) {
        case 'access_denied': // end-user declined the device confirmation prompt, consent or rules failed
          console.error('\n\ncancelled interaction');
          break;
        case 'expired_token': // end-user did not complete the interaction in time
          console.error('\n\ndevice flow expired');
          break;
        default:
          if (err instanceof errors.OPError) {
            console.error(
              `\n\nerror = ${error}; error_description = ${error_description}`
            );
          } else {
            throw err;
          }
      }
    }

    if (tokens) {
      console.log('\n\nresult tokens', { ...tokens });

      // requests without openid scope will not contain an id_token
      if (tokens.id_token) {
        console.log('\n\nID Token Claims', tokens.claims());
      }

      // try-catching this since resource may have been used and the access token may
      // not be eligible for accessing the UserInfo Response
      try {
        console.log('\n\nUserInfo response', await client.userinfo(tokens));
      } catch (err) {
        //
      }
    }
  }

  try {
    const result = await loginProcessor();

    console.log(result);
  } catch (err) {
    console.error('Authentication failed', err);
  }

  process.stdout.write('Off we go');
  process.exit(0);
};

export default {
  command: 'auth',
  desc: 'Authenticate with your Salable Account',
  handler,
};
