﻿/// Orchard Collaboration is a series of plugins for Orchard CMS that provides an integrated ticketing system and collaboration framework on top of it.
/// Copyright (C) 2014-2016  Siyamand Ayubi
///
/// This file is part of Orchard Collaboration.
///
///    Orchard Collaboration is free software: you can redistribute it and/or modify
///    it under the terms of the GNU General Public License as published by
///    the Free Software Foundation, either version 3 of the License, or
///    (at your option) any later version.
///
///    Orchard Collaboration is distributed in the hope that it will be useful,
///    but WITHOUT ANY WARRANTY; without even the implied warranty of
///    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
///    GNU General Public License for more details.
///
///    You should have received a copy of the GNU General Public License
///    along with Orchard Collaboration.  If not, see <http://www.gnu.org/licenses/>.

using Orchard.ContentManagement;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Orchard.ContentManagement;
using Orchard.CRM.Core.Models;
using Orchard.Localization;
using System.Globalization;
using Orchard.Core.Title.Models;

namespace Orchard.CRM.Core.Providers.ActivityStream.Descriptors
{
    public class TitleDescriptor : IContentItemDescriptor
    {
        public string GetDescription(IContent content)
        {
            var titlePart = content.As<TitlePart>();
            if (titlePart == null)
            {
                return string.Empty;
            }

            return titlePart.Title;
        }

        public bool CanApply(IContent content)
        {
            return content.As<TitlePart>() != null;
        }
    }
}