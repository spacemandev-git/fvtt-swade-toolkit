# List of Questions to run through when testing

- A user should be able to add a Transformer for a token
- A user should be able to add a Transformer for an Actor
- A user should be able to see the transformers active on a token and it's respective actor. The actor ones should have a little icon by them.
- Transformers should only be triggered on the machine that owns the token/actor
- Transformers should only be triggered for the token/actor they are registered for
- Transformers should fire in execute order
- Transformers should always be listed in execution order
- Transformers should be deleted when the relevant token or actor is deleted (but not wildcard transformers!)
- Wild Card ("*") transformers should show up Yellow in the transformer list