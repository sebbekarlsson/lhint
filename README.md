# lhint
__Learn the Hints__

A utility that automatically "learns" type hints from any data.

## Install
```
npm install lhint
```

## API Interface
### Examples
#### Learned hints
```typescript
import { hints } from 'lhint';

// The following automatically "learns" the types
const hint = hints.auto({
  firstname: 'john',
  lastname: 'doe'
})
// And this will give the same as manually doing this:
const myHint = hints.mapping({
  firstname: hints.string(),
  lastname: hints.string()
});
```

#### Transforming
These transformations are currently available:
- typescript-template (generates typescript types in the form of a string)
- json-schema (generates json-schema objects)

##### Example
```typescript
import { hints, TypescriptTemplateTransformer } from 'lhint';

const hint = hints.auto({
  firstname: 'john',
  lastname: 'doe',
  friend: hints.optional(hints.mapping({
    name: hints.string()
  }))
});

const ts: string = TypescriptTemplateTransformer.transform(hint);
/* 
  {
    firstname: string,
    lastname: string,
    friend?: {
      name: string
    }
  }
*/
```

#### Basic hint usage
```typescript
import { hints } from 'lhint';

const name = hints.string();
const age = hints.number();
const happy = hints.boolean();
const dateOfBirth = hints.date();
const userType = hints.union([hints.literal('admin'), hints.literal('developer')]);

const flags = hints.record(hints.string(), hints.boolean());

const car = hints.mapping({
  brand: hints.string(),
  color: hints.optional(hints.string()),
  price: hints.number(),
});

// "Extract" the typescript type of a hint
const myCar: UnHint<typeof car>;
/**
  This will give the following type:
  {
    brand: string,
    color?: string,
    price: number
  }
*/
```

## CLI
Available commands:
- transform
- hint

### transform 
args:
- source (a stringified JSON | URL to JSON | filepath to JSON)
- format (typescript | json-schema | hint)

#### example
command:
```
lhint transform --source "https://jsonplaceholder.typicode.com/users" --format typescript
```
output:
```
Array<{
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string
    }
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string
  }
}>
```
