import parser from './parser';

export default {
  /**
   * @param {Contract} contract
   * @returns {Promise.<void>}
   */
  async validateContractSchema(contract) {
    await parser.parse(contract);
  }
}