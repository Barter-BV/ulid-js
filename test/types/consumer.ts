import pulid, {
  EntropyGenerator,
  GenerateOptions,
  pULID,
  pULIDGenerator,
  parse,
  scopedGenerator
} from '@barter-bv/ulid-ts';

const options: GenerateOptions = { scope: 200 };
const id: string = pulid(options);
const parsed: pULID = parse(id);
const generator: pULIDGenerator = scopedGenerator(parsed.getScope(), {
  entropyGenerator: new EntropyGenerator()
});
const nextId: string = generator.generateString();

void nextId;
