package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2019-20.
 *
 * This file is part of MC.
 *
 * MC is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MC is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with MC.  If not, see <https://www.gnu.org/licenses/>.
 */

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.in;
import static org.hamcrest.Matchers.is;

import java.net.HttpURLConnection;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

/**
 * <p>
 * Definitions of BDD steps for the Cucumber-JVM BDD testing tool for steps
 * pertaining to unknown resources.
 * </p>
 */
public class UnknownResourceSteps {

   @Autowired
   private WorldCore worldCore;

   @SuppressWarnings("unused")
   @Autowired
   private WorldCoreScenarioHook worldCoreScenarioHook;

   private int httpResponseCode;

   private void doHttpRequest(final String method, final String path) {
      worldCore.setUrlPath(path);
      httpResponseCode = worldCore.getHttpResponseCode(method);
   }

   @Then("MC replies with Not Found or Forbidden or Method Not Allowed")
   public void mc_replies_with_not_found_or_forbidden_or_method_not_allowed() {
      final var expected = Set.<Integer>of(HttpURLConnection.HTTP_NOT_FOUND,
               HttpURLConnection.HTTP_FORBIDDEN,
               HttpURLConnection.HTTP_BAD_METHOD);
      assertThat(httpResponseCode, is(in(expected)));
   }

   @When("modifying the unknown resource with a {string} at {string}")
   public void modifying_the_unknown_resource_with_a(final String method,
            final String path) {
      doHttpRequest(method, path);
   }

}
