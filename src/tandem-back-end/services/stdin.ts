import { Logger } from "tandem-common/logger";
import * as chalk from "chalk";
import * as readline from "readline";
import { IApplication } from "tandem-common/application";
import { loggable, document } from "tandem-common/decorators";
import { BaseApplicationService } from "tandem-common/services";
import { ApplicationServiceDependency } from "tandem-common/dependencies";

/**
 * console input command handler
 */

@loggable()
export default class StdinService extends BaseApplicationService<IApplication> {

  public logger:Logger;
  private _rl:readline.ReadLine;

  initialize() {
    this._rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this._readInput();
    this.logger.prefix = "";
  }

  /**
   * returns the available command-line actions
   */

  @document("shows help menu")
  help() {

    this.app.bus.actors.forEach((actor) => {
      var docs = (actor as any).__documentation || {};

      for (let actionType in docs) {
        this.logger.info("{ type: %s }: %s", chalk.bold(actionType), docs[actionType]);
      }
    });
  }

  _readInput = () => {
    this._rl.question("> ", this._onInput);
  }

  _onInput = async (text) => {

    var action;

    try {
      action = (new Function(`return ${text};`))();
    } catch (e) {
      action = { type: text };
    }

    try {
      var response = this.bus.execute(action);
      var value;
      var done;
      while ({ value, done } = await response.read()) {
        if (done) break;
        this.logger.info(value);
      }
    } catch (e) {
      this.logger.error(e.message);
    }
    this._readInput();
  }
}

export const stdinServiceDependency = new ApplicationServiceDependency("stdin", StdinService);