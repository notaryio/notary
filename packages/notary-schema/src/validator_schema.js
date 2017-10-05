import Ajv from 'ajv';
import { VError } from 'verror';

import configParser from './config_parser';
import parser from './parser';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  v5: true
});

export default {
  async validate(contract) {
    const contractContent = await parser.parse(
      contract.localContentPath
    );

    if (!contract.definition.meta.prototypeName) {
      throw new VError(
        'Contract definitions of type "schema" needs a meta.prototypeName field defined.'
      );
    }

    const proto = configParser.prototypeByName(contract.definition.meta.prototypeName);
    if (!configParser.prototypeByName(contract.definition.meta.prototypeName)) {
      throw new VError(
        `Invalid prototype ${contract.definition.meta
          .prototypeName}, contact your administrator to get the correct prototype name.`
      );
    }

    const matchesPrototype = ajv.validate(proto.schema, contractContent);
    if (!matchesPrototype) {
      throw new VError(`Contract doesn't match the prototype: ${ajv.errorsText()}`);
    }
  }
}