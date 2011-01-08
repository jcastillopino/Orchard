using System;
using System.Collections.Generic;
using System.Linq;
using Orchard.Data;
using Orchard.Environment.Extensions;
using Orchard.Environment.Extensions.Models;
using Orchard.Localization;
using Orchard.Packaging.GalleryServer;
using Orchard.Packaging.Models;

namespace Orchard.Packaging.Services {
    [OrchardFeature("Gallery")]
    public class PackagingSourceManager : IPackagingSourceManager {
        public static string GetExtensionPrefix(string extensionType) {
            return string.Format("Orchard.{0}.", extensionType);
        }

        private readonly IRepository<PackagingSource> _packagingSourceRecordRepository;

        public PackagingSourceManager(IRepository<PackagingSource> packagingSourceRecordRepository) {
            _packagingSourceRecordRepository = packagingSourceRecordRepository;
            T = NullLocalizer.Instance;
        }

        Localizer T { get; set; }

        #region IPackagingSourceManager Members

        public IEnumerable<PackagingSource> GetSources() {
            return _packagingSourceRecordRepository.Table.ToList();
        }

        public void AddSource(string feedTitle, string feedUrl) {
            var packagingSource = new PackagingSource {FeedTitle = feedTitle, FeedUrl = feedUrl};
            _packagingSourceRecordRepository.Create(packagingSource);
        }

        public void RemoveSource(int id) {
            var packagingSource = _packagingSourceRecordRepository.Get(id);
            if(packagingSource != null) {
                _packagingSourceRecordRepository.Delete(packagingSource);
            }
        }

        public IEnumerable<PackagingEntry> GetModuleList(PackagingSource packagingSource = null) {
            return GetExtensionList(DefaultExtensionTypes.Module, packagingSource);
        }
        public IEnumerable<PackagingEntry> GetThemeList(PackagingSource packagingSource = null) {
            return GetExtensionList(DefaultExtensionTypes.Theme, packagingSource);
        }

        private IEnumerable<PackagingEntry> GetExtensionList(string filter = null, PackagingSource packagingSource = null) {
            return (packagingSource == null ? GetSources() : new[] {packagingSource})
                .SelectMany(
                    source => {
                        GalleryFeedContext galleryFeedContext = new GalleryFeedContext(new Uri(source.FeedUrl));
                        return galleryFeedContext.Packages
                            .Where(p => p.PackageType == filter)
                            .ToList()
                            .Select(p => CreatePackageEntry(p, packagingSource, galleryFeedContext.GetReadStreamUri(p)));
                    }
                ).ToArray();
        }

        private static PackagingEntry CreatePackageEntry(PublishedPackage package, PackagingSource source, Uri downloadUri) {
            PublishedScreenshot firstScreenshot = package.Screenshots.FirstOrDefault();

            Uri iconUrl = null;
            if (!string.IsNullOrEmpty(package.IconUrl)) {
                if (!Uri.TryCreate(package.IconUrl, UriKind.Absolute, out iconUrl)) {
                    Uri.TryCreate(
                        new Uri(string.Format("{0}://{1}:{2}/",
                            downloadUri.Scheme,
                            downloadUri.Host,
                            downloadUri.Port)),
                        package.IconUrl,
                        out iconUrl);
                }
            }

            return new PackagingEntry {
                Title = string.IsNullOrWhiteSpace(package.Title) ? package.Id : package.Title,
                PackageId = package.Id,
                PackageStreamUri = downloadUri.ToString(),
                ProjectUrl = package.ProjectUrl,
                Source = source,
                Version = package.Version ?? string.Empty,
                Description = package.Description,
                Authors = package.Authors,
                LastUpdated = package.LastUpdated,
                IconUrl = iconUrl != null ? iconUrl.ToString() : string.Empty,
                FirstScreenshot = firstScreenshot != null ? firstScreenshot.ScreenshotUri : string.Empty,
                Rating = package.Rating,
                RatingsCount = package.RatingsCount
            };
        }

        #endregion
    }
}