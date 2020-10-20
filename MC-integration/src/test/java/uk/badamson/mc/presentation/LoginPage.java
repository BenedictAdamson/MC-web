package uk.badamson.mc.presentation;
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

import java.util.Objects;

import javax.annotation.concurrent.Immutable;

import org.openqa.selenium.By;

/**
 * <p>
 * A <i>page object</i> for the login page.
 * </p>
 */
@Immutable
public final class LoginPage extends Page {

   private static final String PATH = "/login";

   /**
    * <p>
    * Construct a login page object associated with an existing page.
    * </p>
    *
    * @param page
    *           The existing page.
    * @throws NullPointerException
    *            If {@code page} is null.
    */
   public LoginPage(final Page page) {
      super(page);
   }

   @Override
   public void assertInvariants() {
      super.assertInvariants();
   }

   public void assertRejectedLogin() {
      assertInvariants();// guard
      assertHasErrorMessage();
   }

   @Override
   protected boolean isValidPath(final String path) {
      Objects.requireNonNull(path, "path");
      return PATH.equals(path);
   }

   public void submitLoginForm(final String user, final String password) {
      Objects.requireNonNull(user, "user");
      Objects.requireNonNull(password, "password");
      requireIsCurrentPath();

      findElement(By.name("username")).sendKeys(user);
      findElement(By.xpath("//input[@type='password']")).sendKeys(password);
      findElement(By.xpath("//button[@type='submit']")).submit();
   }
}
