import { NamedUUID } from './named-uuid';

/**
 * <p>
 * A scenario of the Mission Command game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.Scenario.
 * </p>
 */
export class Scenario {
   constructor(
      public identifier: string,// typically a UUID
      public title: string,
      public description: string,
      /**
       * <p>
       * The names and IDs of the persons in this scenario that
       * players can play.
       * </p>
       * <ul>
       * <li>The list of characters is in descending order of selection priority:
       * with all else equal, players should be allocated characters near the start
       * of the list.</li>
       * </ul>
       */
      public characters: NamedUUID[]
   ) { };

   characterWithId(id: string): string | null {
      const v = this.characters.find(c => c.id === id);
      return v ? v.title : null;
   }
}
