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

import javax.annotation.Nonnull;

import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

/**
 * <p>
 * Definitions of BDD steps for the Cucumber-JVM BDD testing tool for steps
 * pertaining to unknown resources.
 * </p>
 */
public class UnknownResourceSteps extends Steps {

   private static final Set<Integer> CLIENT_ERROR_STATUSES = Set.<Integer>of(
            HttpURLConnection.HTTP_BAD_REQUEST,
            HttpURLConnection.HTTP_UNAUTHORIZED,
            HttpURLConnection.HTTP_PAYMENT_REQUIRED,
            HttpURLConnection.HTTP_FORBIDDEN, HttpURLConnection.HTTP_NOT_FOUND,
            HttpURLConnection.HTTP_BAD_METHOD,
            HttpURLConnection.HTTP_NOT_ACCEPTABLE,
            HttpURLConnection.HTTP_PROXY_AUTH,
            HttpURLConnection.HTTP_CLIENT_TIMEOUT,
            HttpURLConnection.HTTP_CONFLICT, HttpURLConnection.HTTP_GONE,
            HttpURLConnection.HTTP_LENGTH_REQUIRED,
            HttpURLConnection.HTTP_PRECON_FAILED,
            HttpURLConnection.HTTP_ENTITY_TOO_LARGE,
            HttpURLConnection.HTTP_REQ_TOO_LONG,
            HttpURLConnection.HTTP_UNSUPPORTED_TYPE);

   private int httpResponseCode;

   @Autowired
   public UnknownResourceSteps(@Nonnull final World world) {
      super(world);
   }

   private void doHttpRequest(final String method, final String path) {
      world.setUrlPath(path);
      httpResponseCode = world.getHttpResponseCode(method);
   }

   @Then("MC replies with Client Error")
   public void mc_replies_with_client_error() {
      assertThat(httpResponseCode, is(in(CLIENT_ERROR_STATUSES)));
   }

   @When("modifying the unknown resource with a {string} at {string}")
   public void modifying_the_unknown_resource_with_a(final String method,
            final String path) {
      doHttpRequest(method, path);
   }

}
