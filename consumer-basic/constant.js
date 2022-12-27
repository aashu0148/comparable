const queueTypes = {
  todoBasic: "todoBasic",
  todoMedium: "todoMedium",
  todoHeavy: "todoHeavy",
  todoHeavyMedium: "todoHeavyMedium",
  finishedTask: "finished-task",
};

const allScrappersList = {
  amazon: "amazon",
  flipkart: "flipkart",
  jiomart: "jiomart",
  meesho: "meesho",
  myntra: "myntra",
  tatacliq: "tatacliq",
  ajio: "ajio",
  nykaa: "nykaa",
  snapdeal: "snapdeal",
  reliance: "reliance",
  croma: "croma",
  shopclues: "shopclues",
  oyoHotel: "oyoHotel",
  bookingsHotel: "bookingsHotel",
  hotelsHotel: "hotelsHotel",
  goibiboHotel: "goibiboHotel",
  agodaHotel: "agodaHotel",
  mmtHotel: "mmtHotel",
};

const suggestionScrapperList = {
  hotels: "hotels-suggest",
  oyo: "oyo-suggest",
  bookings: "bookings-suggest",
  goibibo: "goibibo-suggest",
  agoda: "agoda-suggest",
  mmt: "mmt-suggest",
};

const offerScrappersList = [
  allScrappersList.amazon,
  allScrappersList.flipkart,
  allScrappersList.tatacliq,
  allScrappersList.reliance,
  allScrappersList.croma,
];

const offerScrapperQueueTypes = {
  [allScrappersList.amazon]: queueTypes.todoHeavy,
  [allScrappersList.croma]: queueTypes.todoHeavy,
  [allScrappersList.flipkart]: queueTypes.todoHeavy,
  [allScrappersList.tatacliq]: queueTypes.todoHeavy,
  [allScrappersList.reliance]: queueTypes.todoHeavy,
};

const availableSortOptions = {
  popularity: "popularity",
  priceLowToHigh: "priceLowToHigh",
  priceHighToLow: "priceHighToLow",
  newest: "newest",
  featured: "featured",
};

const filterTypes = {
  size: {
    S: "S",
    M: "M",
    L: "L",
    XL: "XL",
    "2XL": "2XL",
    "3XL": "3XL",
    "4XL": "4XL",
    30: 30,
    32: 32,
    34: 34,
    36: 36,
    38: 38,
    40: 40,
    42: 42,
    UK6: "UK6",
    UK7: "UK7",
    UK8: "UK8",
    UK9: "UK9",
    UK10: "UK10",
    UK11: "UK11",
    UK12: "UK12",
    "28A": "28A",
    "30A": "30A",
    "32A": "32A",
    "34A": "34A",
    "36A": "36A",
    "38A": "38A",
    "40A": "40A",
    "28B": "28B",
    "30B": "30B",
    "32B": "32B",
    "34B": "34B",
    "36B": "36B",
    "38B": "38B",
    "40B": "40B",
    "28C": "28C",
    "30C": "30C",
    "32C": "32C",
    "34C": "34C",
    "36C": "36C",
    "38C": "38C",
    "40C": "40C",
    "28D": "28D",
    "30D": "30D",
    "32D": "32D",
    "34D": "34D",
    "36D": "36D",
    "38D": "38D",
    "40D": "40D",
    "28E": "28E",
    "30E": "30E",
    "32E": "32E",
    "34E": "34E",
    "36E": "36E",
    "38E": "38E",
    "40E": "40E",
  },
  gender: {
    men: "men",
    women: "women",
  },
};

const availableFilterOptions = {
  price: "price",
  gender: "gender",
  size: "size",
};

const getAgodaCitySearchObj = (details = {}) => {
  // required - userId,checkInDate,checkOutDate,adults,rooms,cityId,areaId

  return {
    operationName: "citySearch",
    variables: {
      CitySearchRequest: {
        cityId: parseInt(details.cityId),
        searchRequest: {
          searchCriteria: {
            isAllowBookOnRequest: true,
            bookingDate: new Date(),
            checkInDate: new Date(details.checkInDate),
            localCheckInDate: new Date(details.checkInDate)
              .toLocaleDateString("en-in")
              .split("/")
              .reverse()
              .join("-"),
            los: 2,
            rooms: details.rooms,
            adults: details.adults,
            children: details.children?.length || 0,
            childAges: details.children?.length ? details.children : [],
            ratePlans: [],
            featureFlagRequest: {
              fetchNamesForTealium: true,
              fiveStarDealOfTheDay: true,
              isAllowBookOnRequest: false,
              showUnAvailable: true,
              showRemainingProperties: true,
              isMultiHotelSearch: false,
              enableAgencySupplyForPackages: true,
              flags: [
                {
                  feature: "FamilyChildFriendlyPopularFilter",
                  enable: true,
                },
                {
                  feature: "FamilyChildFriendlyPropertyTypeFilter",
                  enable: true,
                },
                {
                  feature: "FamilyMode",
                  enable: false,
                },
              ],
              enablePageToken: false,
              enableDealsOfTheDayFilter: false,
              isEnableSupplierFinancialInfo: false,
            },
            isUserLoggedIn: false,
            currency: "INR",
            travellerType: "Couple",
            isAPSPeek: false,
            enableOpaqueChannel: false,
            isEnabledPartnerChannelSelection: null,
            sorting: {
              sortField: "Ranking",
              sortOrder: "Desc",
              sortParams: null,
            },
            requiredBasis: "PRPN",
            requiredPrice: "Exclusive",
            suggestionLimit: 0,
            synchronous: false,
            supplierPullMetadataRequest: null,
            isRoomSuggestionRequested: false,
            isAPORequest: false,
            hasAPOFilter: false,
          },
          searchContext: {
            userId: details.userId || "1d45a956-1222-4cd7-8a3e-6c4526075cc8",
            memberId: 0,
            locale: "en-gb",
            cid: -999,
            origin: "IN",
            platform: 1,
            deviceTypeId: 1,
            experiments: {
              forceByVariant: null,
              forceByExperiment: [
                {
                  id: "UMRAH-B2B",
                  variant: "B",
                },
                {
                  id: "UMRAH-B2C-REGIONAL",
                  variant: "B",
                },
                {
                  id: "UMRAH-B2C",
                  variant: "Z",
                },
                {
                  id: "JGCW-204",
                  variant: "B",
                },
                {
                  id: "JGCW-264",
                  variant: "B",
                },
                {
                  id: "JGCW-202",
                  variant: "B",
                },
                {
                  id: "JGCW-299",
                  variant: "B",
                },
                {
                  id: "FD-3936",
                  variant: "B",
                },
              ],
            },
            isRetry: false,
            showCMS: false,
            storeFrontId: 3,
            pageTypeId: 103,
            whiteLabelKey: null,
            ipAddress: "157.36.199.36",
            endpointSearchType: "CitySearch",
            trackSteps: null,
            searchId: "9786e37e-fadf-49d8-8236-77d172d7bdb0",
          },
          matrix: null,
          matrixGroup: [
            {
              matrixGroup: "NumberOfBedrooms",
              size: 100,
            },
            {
              matrixGroup: "LandmarkIds",
              size: 10,
            },
            {
              matrixGroup: "AllGuestReviewBreakdown",
              size: 100,
            },
            {
              matrixGroup: "GroupedBedTypes",
              size: 100,
            },
            {
              matrixGroup: "RoomBenefits",
              size: 100,
            },
            {
              matrixGroup: "AtmosphereIds",
              size: 100,
            },
            {
              matrixGroup: "RoomAmenities",
              size: 100,
            },
            {
              matrixGroup: "AffordableCategory",
              size: 100,
            },
            {
              matrixGroup: "HotelFacilities",
              size: 100,
            },
            {
              matrixGroup: "BeachAccessTypeIds",
              size: 100,
            },
            {
              matrixGroup: "StarRating",
              size: 20,
            },
            {
              matrixGroup: "MetroSubwayStationLandmarkIds",
              size: 20,
            },
            {
              matrixGroup: "CityCenterDistance",
              size: 100,
            },
            {
              matrixGroup: "ProductType",
              size: 100,
            },
            {
              matrixGroup: "BusStationLandmarkIds",
              size: 20,
            },
            {
              matrixGroup: "IsSustainableTravel",
              size: 2,
            },
            {
              matrixGroup: "ReviewLocationScore",
              size: 3,
            },
            {
              matrixGroup: "LandmarkSubTypeCategoryIds",
              size: 20,
            },
            {
              matrixGroup: "ReviewScore",
              size: 100,
            },
            {
              matrixGroup: "AccommodationType",
              size: 100,
            },
            {
              matrixGroup: "PaymentOptions",
              size: 100,
            },
            {
              matrixGroup: "TrainStationLandmarkIds",
              size: 20,
            },
            {
              matrixGroup: "HotelAreaId",
              size: 100,
            },
            {
              matrixGroup: "HotelChainId",
              size: 10,
            },
            {
              matrixGroup: "RecommendedByDestinationCity",
              size: 10,
            },
            {
              matrixGroup: "Deals",
              size: 100,
            },
          ],
          filterRequest: {
            idsFilters: [],
            rangeFilters: [],
            textFilters: [],
          },
          page: {
            pageSize: 45,
            pageNumber: 1,
            pageToken: "",
          },
          apoRequest: {
            apoPageSize: 10,
          },
          searchHistory: null,
          searchDetailRequest: {
            priceHistogramBins: 50,
          },
          isTrimmedResponseRequested: false,
          featuredAgodaHomesRequest: null,
          featuredLuxuryHotelsRequest: null,
          highlyRatedAgodaHomesRequest: {
            numberOfAgodaHomes: 30,
            minimumReviewScore: 7.5,
            minimumReviewCount: 3,
            accommodationTypes: [
              28, 29, 30, 102, 103, 106, 107, 108, 109, 110, 114, 115, 120, 131,
            ],
            sortVersion: 0,
          },
          extraAgodaHomesRequest: null,
          extraHotels: {
            extraHotelIds: [],
            enableFiltersForExtraHotels: false,
          },
          packaging: null,
          flexibleSearchRequest: {
            fromDate: new Date()
              .toLocaleDateString("en-in", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
              .split("/")
              .reverse()
              .join("-"),
            toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toLocaleDateString("en-in", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
              .split("/")
              .reverse()
              .join("-"),
            alternativeDateSize: 4,
            isFullFlexibleDateSearch: false,
          },
          rankingRequest: {
            isNhaKeywordSearch: false,
            isPulseRankingBoost: false,
          },
          rocketmilesRequestV2: null,
        },
      },
      ContentSummaryRequest: {
        context: {
          rawUserId: details.userId || "1d45a956-1222-4cd7-8a3e-6c4526075cc8",
          memberId: 0,
          userOrigin: "IN",
          locale: "en-gb",
          forceExperimentsByIdNew: [
            {
              key: "UMRAH-B2B",
              value: "B",
            },
            {
              key: "UMRAH-B2C-REGIONAL",
              value: "B",
            },
            {
              key: "UMRAH-B2C",
              value: "Z",
            },
            {
              key: "JGCW-204",
              value: "B",
            },
            {
              key: "JGCW-264",
              value: "B",
            },
            {
              key: "JGCW-202",
              value: "B",
            },
            {
              key: "JGCW-299",
              value: "B",
            },
            {
              key: "FD-3936",
              value: "B",
            },
          ],
          apo: false,
          searchCriteria: {
            cityId: 513298,
          },
          platform: {
            id: 1,
          },
          storeFrontId: 3,
          cid: "-999",
          occupancy: {
            numberOfAdults: 2,
            numberOfChildren: 0,
            travelerType: 2,
            checkIn: new Date(details.checkInDate),
          },
          deviceTypeId: 1,
          whiteLabelKey: "",
          correlationId: "",
        },
        summary: {
          highlightedFeaturesOrderPriority: null,
          description: false,
          includeHotelCharacter: true,
        },
        reviews: {
          commentary: null,
          demographics: {
            providerIds: null,
            filter: {
              defaultProviderOnly: true,
            },
          },
          summaries: {
            providerIds: null,
            apo: true,
            limit: 1,
            travellerType: 2,
          },
          cumulative: {
            providerIds: null,
          },
          filters: null,
        },
        images: {
          page: null,
          maxWidth: 0,
          maxHeight: 0,
          imageSizes: null,
          indexOffset: null,
        },
        rooms: {
          images: null,
          featureLimit: 0,
          filterCriteria: null,
          includeMissing: false,
          includeSoldOut: false,
          includeDmcRoomId: false,
          soldOutRoomCriteria: null,
          showRoomSize: true,
          showRoomFacilities: true,
        },
        nonHotelAccommodation: true,
        engagement: true,
        highlights: {
          maxNumberOfItems: 0,
          images: {
            imageSizes: [
              {
                key: "full",
                size: {
                  width: 0,
                  height: 0,
                },
              },
            ],
          },
        },
        personalizedInformation: false,
        localInformation: {
          images: null,
        },
        features: null,
        rateCategories: true,
        contentRateCategories: {
          escapeRateCategories: {},
        },
        synopsis: true,
      },
      PricingSummaryRequest: {
        cheapestOnly: true,
        context: {
          isAllowBookOnRequest: true,
          abTests: [
            {
              testId: 9021,
              abUser: "B",
            },
            {
              testId: 9023,
              abUser: "B",
            },
            {
              testId: 9024,
              abUser: "B",
            },
            {
              testId: 9025,
              abUser: "B",
            },
            {
              testId: 9027,
              abUser: "B",
            },
            {
              testId: 9029,
              abUser: "B",
            },
          ],
          clientInfo: {
            cid: -999,
            languageId: 1,
            languageUse: 1,
            origin: "IN",
            platform: 1,
            searchId: "9786e37e-fadf-49d8-8236-77d172d7bdb0",
            storefront: 3,
            userId: "1d45a956-1222-4cd7-8a3e-6c4526075cc8",
            ipAddress: "157.36.199.36",
          },
          // clientInfo: {
          //   cid: -999,
          //   languageId: 1,
          //   languageUse: 1,
          //   origin: "IN",
          //   platform: 1,
          //   searchId: "9786e37e-fadf-49d8-8236-77d172d7bdb0",
          //   storefront: 3,
          //   userId: details.userId || "1d45a956-1222-4cd7-8a3e-6c4526075cc8",
          // },
          experiment: [
            {
              name: "UMRAH-B2B",
              variant: "B",
            },
            {
              name: "UMRAH-B2C-REGIONAL",
              variant: "B",
            },
            {
              name: "UMRAH-B2C",
              variant: "Z",
            },
            {
              name: "JGCW-204",
              variant: "B",
            },
            {
              name: "JGCW-264",
              variant: "B",
            },
            {
              name: "JGCW-202",
              variant: "B",
            },
            {
              name: "JGCW-299",
              variant: "B",
            },
            {
              name: "FD-3936",
              variant: "B",
            },
          ],
          isDebug: false,
          sessionInfo: {
            isLogin: false,
            memberId: 0,
            sessionId: 1,
          },
          packaging: null,
        },
        isSSR: true,
        roomSortingStrategy: null,
        pricing: {
          bookingDate: new Date(),
          checkIn: new Date(details.checkInDate),
          checkout: new Date(details.checkOutDate),
          localCheckInDate: new Date(details.checkInDate)
            .toLocaleDateString("en-in")
            .split("/")
            .reverse()
            .join("-"),
          localCheckoutDate: new Date(details.checkOutDate)
            .toLocaleDateString("en-in")
            .split("/")
            .reverse()
            .join("-"),
          currency: "INR",
          details: {
            cheapestPriceOnly: false,
            itemBreakdown: false,
            priceBreakdown: false,
          },
          featureFlag: [
            "ClientDiscount",
            "PriceHistory",
            "VipPlatinum",
            "RatePlanPromosCumulative",
            "PromosCumulative",
            "CouponSellEx",
            "MixAndSave",
            "APSPeek",
            "StackChannelDiscount",
            "AutoApplyPromos",
            "EnableAgencySupplyForPackages",
            "EnableCashback",
            "CreditCardPromotionPeek",
            "DispatchGoLocalForInternational",
            "EnableGoToTravelCampaign",
          ],
          features: {
            crossOutRate: false,
            isAPSPeek: false,
            isAllOcc: false,
            isApsEnabled: false,
            isIncludeUsdAndLocalCurrency: false,
            isMSE: true,
            isRPM2Included: true,
            maxSuggestions: 0,
            isEnableSupplierFinancialInfo: false,
            isLoggingAuctionData: false,
            newRateModel: false,
            overrideOccupancy: false,
            filterCheapestRoomEscapesPackage: false,
            priusId: 0,
            synchronous: false,
            enableRichContentOffer: true,
            showCouponAmountInUserCurrency: false,
            disableEscapesPackage: false,
            enablePushDayUseRates: false,
            enableDayUseCor: false,
          },
          filters: {
            cheapestRoomFilters: [],
            filterAPO: false,
            ratePlans: [1],
            secretDealOnly: false,
            suppliers: [],
            nosOfBedrooms: [],
          },
          includedPriceInfo: false,
          occupancy: {
            adults: 2,
            children: 0,
            childAges: [],
            rooms: 1,
            childrenTypes: [],
          },
          supplierPullMetadata: {
            requiredPrecheckAccuracyLevel: 0,
          },
          mseHotelIds: [],
          ppLandingHotelIds: [],
          searchedHotelIds: [],
          paymentId: -999,
          externalLoyaltyRequest: null,
        },
        suggestedPrice: "Exclusive",
      },
      PriceStreamMetaLabRequest: {
        attributesId: [8, 1, 18, 7, 11, 2, 3],
      },
    },
    query:
      "query citySearch($CitySearchRequest: CitySearchRequest!, $ContentSummaryRequest: ContentSummaryRequest!, $PricingSummaryRequest: PricingRequestParameters, $PriceStreamMetaLabRequest: PriceStreamMetaLabRequest) {\n  citySearch(CitySearchRequest: $CitySearchRequest) {\n    searchResult {\n      sortMatrix {\n        result {\n          fieldId\n          sorting {\n            sortField\n            sortOrder\n            sortParams {\n              id\n            }\n          }\n          display {\n            name\n          }\n          childMatrix {\n            fieldId\n            sorting {\n              sortField\n              sortOrder\n              sortParams {\n                id\n              }\n            }\n            display {\n              name\n            }\n            childMatrix {\n              fieldId\n              sorting {\n                sortField\n                sortOrder\n                sortParams {\n                  id\n                }\n              }\n              display {\n                name\n              }\n            }\n          }\n        }\n      }\n      searchInfo {\n        flexibleSearch {\n          currentDate {\n            checkIn\n            price\n          }\n          alternativeDates {\n            checkIn\n            price\n          }\n        }\n        hasSecretDeal\n        isComplete\n        totalFilteredHotels\n        hasEscapesPackage\n        searchStatus {\n          searchCriteria {\n            checkIn\n          }\n          searchStatus\n        }\n        objectInfo {\n          objectName\n          cityName\n          cityEnglishName\n          countryId\n          countryEnglishName\n          mapLatitude\n          mapLongitude\n          mapZoomLevel\n          wlPreferredCityName\n          wlPreferredCountryName\n          cityId\n          cityCenterPolygon {\n            geoPoints {\n              lon\n              lat\n            }\n            touristAreaCenterPoint {\n              lon\n              lat\n            }\n          }\n        }\n      }\n      urgencyDetail {\n        urgencyScore\n      }\n      histogram {\n        bins {\n          numOfElements\n          upperBound {\n            perNightPerRoom\n            perPax\n          }\n        }\n      }\n      nhaProbability\n    }\n    properties(ContentSummaryRequest: $ContentSummaryRequest, PricingSummaryRequest: $PricingSummaryRequest, PriceStreamMetaLabRequest: $PriceStreamMetaLabRequest) {\n      propertyId\n      sponsoredDetail {\n        sponsoredType\n        trackingData\n        isShowSponsoredFlag\n      }\n      propertyResultType\n      content {\n        informationSummary {\n          hotelCharacter {\n            hotelTag {\n              name\n              symbol\n            }\n            hotelView {\n              name\n              symbol\n            }\n          }\n          propertyLinks {\n            propertyPage\n          }\n          atmospheres {\n            id\n            name\n          }\n          isSustainableTravel\n          localeName\n          defaultName\n          displayName\n          accommodationType\n          awardYear\n          hasHostExperience\n          address {\n            countryCode\n            country {\n              id\n              name\n            }\n            city {\n              id\n              name\n            }\n            area {\n              id\n              name\n            }\n          }\n          propertyType\n          rating\n          agodaGuaranteeProgram\n          remarks {\n            renovationInfo {\n              renovationType\n              year\n            }\n          }\n          spokenLanguages {\n            id\n          }\n          geoInfo {\n            latitude\n            longitude\n          }\n        }\n        propertyEngagement {\n          lastBooking\n          peopleLooking\n        }\n        nonHotelAccommodation {\n          masterRooms {\n            noOfBathrooms\n            noOfBedrooms\n            noOfBeds\n            roomSizeSqm\n            highlightedFacilities\n          }\n          hostLevel {\n            id\n            name\n          }\n          supportedLongStay\n        }\n        facilities {\n          id\n        }\n        images {\n          hotelImages {\n            id\n            caption\n            providerId\n            urls {\n              key\n              value\n            }\n          }\n        }\n        reviews {\n          contentReview {\n            isDefault\n            providerId\n            demographics {\n              groups {\n                id\n                grades {\n                  id\n                  score\n                }\n              }\n            }\n            summaries {\n              recommendationScores {\n                recommendationScore\n              }\n              snippets {\n                countryId\n                countryCode\n                countryName\n                date\n                demographicId\n                demographicName\n                reviewer\n                reviewRating\n                snippet\n              }\n            }\n            cumulative {\n              reviewCount\n              score\n            }\n          }\n          cumulative {\n            reviewCount\n            score\n          }\n        }\n        familyFeatures {\n          hasChildrenFreePolicy\n          isFamilyRoom\n          hasMoreThanOneBedroom\n          isInterConnectingRoom\n          isInfantCottageAvailable\n          hasKidsPool\n          hasKidsClub\n        }\n        personalizedInformation {\n          childrenFreePolicy {\n            fromAge\n            toAge\n          }\n        }\n        localInformation {\n          landmarks {\n            transportation {\n              landmarkName\n              distanceInM\n            }\n            topLandmark {\n              landmarkName\n              distanceInM\n            }\n            beach {\n              landmarkName\n              distanceInM\n            }\n          }\n          hasAirportTransfer\n        }\n        highlight {\n          cityCenter {\n            distanceFromCityCenter\n          }\n          favoriteFeatures {\n            features {\n              id\n              title\n              category\n            }\n          }\n          hasNearbyPublicTransportation\n        }\n        rateCategories {\n          escapeRateCategories {\n            rateCategoryId\n            localizedRateCategoryName\n          }\n        }\n      }\n      soldOut {\n        soldOutPrice {\n          averagePrice\n        }\n      }\n      pricing {\n        pulseCampaignMetadata {\n          promotionTypeId\n          webCampaignId\n          campaignTypeId\n          campaignBadgeText\n          campaignBadgeDescText\n          dealExpiryTime\n          showPulseMerchandise\n        }\n        isAvailable\n        isReady\n        benefits\n        cheapestRoomOffer {\n          agodaCash {\n            showBadge\n            giftcardGuid\n            dayToEarn\n            earnId\n            percentage\n            expiryDay\n          }\n          cashback {\n            cashbackGuid\n            showPostCashbackPrice\n            cashbackVersion\n            percentage\n            earnId\n            dayToEarn\n            expiryDay\n            cashbackType\n            appliedCampaignName\n          }\n        }\n        isEasyCancel\n        isInsiderDeal\n        suggestPriceType {\n          suggestPrice\n        }\n        roomBundle {\n          bundleId\n          bundleType\n          saveAmount {\n            perNight {\n              ...Frag15ha0ce9hgi3153aif6a\n            }\n          }\n        }\n        pointmax {\n          channelId\n          point\n        }\n        priceChange {\n          changePercentage\n          searchDate\n        }\n        payment {\n          cancellation {\n            cancellationType\n            freeCancellationDate\n          }\n          payLater {\n            isEligible\n          }\n          payAtHotel {\n            isEligible\n          }\n          noCreditCard {\n            isEligible\n          }\n          taxReceipt {\n            isEligible\n          }\n        }\n        cheapestStayPackageRatePlans {\n          stayPackageType\n          ratePlanId\n        }\n        pricingMessages {\n          location\n          ids\n        }\n        suppliersSummaries {\n          id\n          supplierHotelId\n        }\n        supplierInfo {\n          id\n          name\n          isAgodaBand\n        }\n        offers {\n          roomOffers {\n            room {\n              extraPriceInfo {\n                displayPriceWithSurchargesPRPN\n                corDisplayPriceWithSurchargesPRPN\n              }\n              availableRooms\n              isPromoEligible\n              promotions {\n                typeId\n                promotionDiscount {\n                  value\n                }\n                isRatePlanAsPromotion\n                cmsTypeId\n                description\n              }\n              bookingDuration {\n                unit\n                value\n              }\n              supplierId\n              corSummary {\n                hasCor\n                corType\n                isOriginal\n                hasOwnCOR\n                isBlacklistedCor\n              }\n              localVoucher {\n                currencyCode\n                amount\n              }\n              pricing {\n                currency\n                price {\n                  perNight {\n                    exclusive {\n                      display\n                      cashbackPrice\n                      displayAfterCashback\n                      originalPrice\n                    }\n                    inclusive {\n                      display\n                      cashbackPrice\n                      displayAfterCashback\n                      originalPrice\n                    }\n                  }\n                  perBook {\n                    exclusive {\n                      display\n                      cashbackPrice\n                      displayAfterCashback\n                      rebatePrice\n                      originalPrice\n                      autoAppliedPromoDiscount\n                    }\n                    inclusive {\n                      display\n                      cashbackPrice\n                      displayAfterCashback\n                      rebatePrice\n                      originalPrice\n                      autoAppliedPromoDiscount\n                    }\n                  }\n                  perRoomPerNight {\n                    exclusive {\n                      display\n                      crossedOutPrice\n                      cashbackPrice\n                      displayAfterCashback\n                      rebatePrice\n                      pseudoCouponPrice\n                      originalPrice\n                    }\n                    inclusive {\n                      display\n                      crossedOutPrice\n                      cashbackPrice\n                      displayAfterCashback\n                      rebatePrice\n                      pseudoCouponPrice\n                      originalPrice\n                    }\n                  }\n                  totalDiscount\n                  priceAfterAppliedAgodaCash {\n                    perBook {\n                      ...Frag4b1je163e2b10jcidd9a\n                    }\n                    perRoomPerNight {\n                      ...Frag4b1je163e2b10jcidd9a\n                    }\n                  }\n                }\n                apsPeek {\n                  perRoomPerNight {\n                    ...Frag15ha0ce9hgi3153aif6a\n                  }\n                }\n                promotionPricePeek {\n                  display {\n                    perBook {\n                      ...Frag15ha0ce9hgi3153aif6a\n                    }\n                    perRoomPerNight {\n                      ...Frag15ha0ce9hgi3153aif6a\n                    }\n                    perNight {\n                      ...Frag15ha0ce9hgi3153aif6a\n                    }\n                  }\n                  discountType\n                  promotionCodeType\n                  promotionCode\n                  promoAppliedOnFinalPrice\n                  childPromotions {\n                    campaignId\n                  }\n                  campaignName\n                }\n                channelDiscountSummary {\n                  channelDiscountBreakdown {\n                    display\n                    discountPercent\n                    channelId\n                  }\n                }\n                promotionsCumulative {\n                  promotionCumulativeType\n                  amountPercentage\n                  minNightsStay\n                }\n              }\n              uid\n              payment {\n                cancellation {\n                  cancellationType\n                }\n              }\n              discount {\n                deals\n                channelDiscount\n              }\n              saveUpTo {\n                perRoomPerNight\n              }\n              benefits {\n                id\n                targetType\n              }\n              channel {\n                id\n              }\n              mseRoomSummaries {\n                supplierId\n                subSupplierId\n                pricingSummaries {\n                  currency\n                  channelDiscountSummary {\n                    channelDiscountBreakdown {\n                      channelId\n                      discountPercent\n                      display\n                    }\n                  }\n                  price {\n                    perRoomPerNight {\n                      exclusive {\n                        display\n                      }\n                      inclusive {\n                        display\n                      }\n                    }\n                  }\n                }\n              }\n              cashback {\n                cashbackGuid\n                showPostCashbackPrice\n                cashbackVersion\n                percentage\n                earnId\n                dayToEarn\n                expiryDay\n                cashbackType\n                appliedCampaignName\n              }\n              agodaCash {\n                showBadge\n                giftcardGuid\n                dayToEarn\n                expiryDay\n                percentage\n              }\n              corInfo {\n                corBreakdown {\n                  taxExPN {\n                    ...Frag985d7c174dgj27c3g8if\n                  }\n                  taxInPN {\n                    ...Frag985d7c174dgj27c3g8if\n                  }\n                  taxExPRPN {\n                    ...Frag985d7c174dgj27c3g8if\n                  }\n                  taxInPRPN {\n                    ...Frag985d7c174dgj27c3g8if\n                  }\n                }\n                corInfo {\n                  corType\n                }\n              }\n              loyaltyDisplay {\n                items\n              }\n              capacity {\n                extraBedsAvailable\n              }\n              pricingMessages {\n                formatted {\n                  location\n                  texts {\n                    index\n                    text\n                  }\n                }\n              }\n              campaign {\n                selected {\n                  messages {\n                    campaignName\n                    title\n                    titleWithDiscount\n                    description\n                    linkOutText\n                    url\n                  }\n                }\n              }\n              stayPackageType\n            }\n          }\n        }\n      }\n      metaLab {\n        attributes {\n          attributeId\n          dataType\n          value\n          version\n        }\n      }\n      enrichment {\n        topSellingPoint {\n          tspType\n          value\n        }\n        pricingBadges {\n          badges\n        }\n        uniqueSellingPoint {\n          rank\n          segment\n          uspType\n          uspPropertyType\n        }\n        bookingHistory {\n          bookingCount {\n            count\n            timeFrame\n          }\n        }\n        showReviewSnippet\n        isPopular\n        roomInformation {\n          cheapestRoomSizeSqm\n          facilities {\n            id\n            propertyFacilityName\n            symbol\n          }\n        }\n      }\n    }\n    searchEnrichment {\n      suppliersInformation {\n        supplierId\n        supplierName\n        isAgodaBand\n      }\n    }\n    aggregation {\n      matrixGroupResults {\n        matrixGroup\n        matrixItemResults {\n          id\n          name\n          count\n          filterKey\n          filterRequestType\n          extraDataResults {\n            text\n            matrixExtraDataType\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment Frag4b1je163e2b10jcidd9a on DisplayPrice {\n  exclusive\n  allInclusive\n}\n\nfragment Frag15ha0ce9hgi3153aif6a on DFDisplayPrice {\n  exclusive\n  allInclusive\n}\n\nfragment Frag985d7c174dgj27c3g8if on DFCorBreakdownItem {\n  price\n  id\n}\n",
  };
};

const getAgodaAreaSearchObj = (details = {}) => {
  // required - userId,checkInDate,checkOutDate,adults,rooms,cityId,areaId

  return {
    operationName: "areaSearch",
    variables: {
      AreaSearchRequest: {
        cityId: parseInt(details.cityId),
        areaId: details?.area
          ? parseInt(details.area)
          : parseInt(details?.objectId),
        searchRequest: {
          searchCriteria: {
            isAllowBookOnRequest: true,
            bookingDate: new Date(),
            checkInDate: new Date(details.checkInDate),
            localCheckInDate: new Date(details.checkInDate)
              .toLocaleDateString("en-in")
              .split("/")
              .reverse()
              .join("-"),
            los: 1,
            rooms: 1,
            adults: 2,
            children: 0,
            childAges: [],
            ratePlans: [],
            featureFlagRequest: {
              fetchNamesForTealium: true,
              fiveStarDealOfTheDay: true,
              isAllowBookOnRequest: false,
              showUnAvailable: true,
              showRemainingProperties: true,
              isMultiHotelSearch: false,
              enableAgencySupplyForPackages: true,
              flags: [
                {
                  feature: "FamilyChildFriendlyPopularFilter",
                  enable: true,
                },
                {
                  feature: "FamilyChildFriendlyPropertyTypeFilter",
                  enable: true,
                },
                {
                  feature: "FamilyMode",
                  enable: false,
                },
              ],
              enablePageToken: false,
              enableDealsOfTheDayFilter: false,
              isEnableSupplierFinancialInfo: false,
            },
            isUserLoggedIn: false,
            currency: "INR",
            travellerType: "Couple",
            isAPSPeek: false,
            enableOpaqueChannel: false,
            isEnabledPartnerChannelSelection: null,
            sorting: {
              sortField: "Ranking",
              sortOrder: "Desc",
              sortParams: null,
            },
            requiredBasis: "PRPN",
            requiredPrice: "Exclusive",
            suggestionLimit: 0,
            synchronous: false,
            supplierPullMetadataRequest: null,
            isRoomSuggestionRequested: false,
            isAPORequest: false,
            hasAPOFilter: false,
          },
          searchContext: {
            userId: details.userId || "1d45a956-1222-4cd7-8a3e-6c4526075cc8",
            memberId: 0,
            locale: "en-gb",
            cid: -999,
            origin: "IN",
            platform: 1,
            deviceTypeId: 1,
            experiments: {
              forceByVariant: null,
              forceByExperiment: [
                {
                  id: "UMRAH-B2B",
                  variant: "B",
                },
                {
                  id: "UMRAH-B2C-REGIONAL",
                  variant: "B",
                },
                {
                  id: "UMRAH-B2C",
                  variant: "Z",
                },
                {
                  id: "JGCW-204",
                  variant: "B",
                },
                {
                  id: "JGCW-264",
                  variant: "B",
                },
                {
                  id: "JGCW-202",
                  variant: "B",
                },
                {
                  id: "JGCW-299",
                  variant: "B",
                },
                {
                  id: "FD-3936",
                  variant: "B",
                },
              ],
            },
            isRetry: false,
            showCMS: false,
            storeFrontId: 3,
            pageTypeId: 103,
            whiteLabelKey: null,
            ipAddress: "157.36.199.36",
            endpointSearchType: "CitySearch",
            trackSteps: null,
            searchId: "96477b2b-256b-4a4c-b63d-2c9b586a6023",
          },
          matrix: null,
          matrixGroup: [
            {
              matrixGroup: "NumberOfBedrooms",
              size: 100,
            },
            {
              matrixGroup: "AllGuestReviewBreakdown",
              size: 100,
            },
            {
              matrixGroup: "GroupedBedTypes",
              size: 100,
            },
            {
              matrixGroup: "RoomBenefits",
              size: 100,
            },
            {
              matrixGroup: "RoomAmenities",
              size: 100,
            },
            {
              matrixGroup: "AffordableCategory",
              size: 100,
            },
            {
              matrixGroup: "HotelFacilities",
              size: 100,
            },
            {
              matrixGroup: "BeachAccessTypeIds",
              size: 100,
            },
            {
              matrixGroup: "StarRating",
              size: 20,
            },
            {
              matrixGroup: "MetroSubwayStationLandmarkIds",
              size: 20,
            },
            {
              matrixGroup: "CityCenterDistance",
              size: 100,
            },
            {
              matrixGroup: "ProductType",
              size: 100,
            },
            {
              matrixGroup: "BusStationLandmarkIds",
              size: 20,
            },
            {
              matrixGroup: "IsSustainableTravel",
              size: 2,
            },
            {
              matrixGroup: "ReviewLocationScore",
              size: 3,
            },
            {
              matrixGroup: "LandmarkSubTypeCategoryIds",
              size: 20,
            },
            {
              matrixGroup: "ReviewScore",
              size: 100,
            },
            {
              matrixGroup: "AccommodationType",
              size: 100,
            },
            {
              matrixGroup: "PaymentOptions",
              size: 100,
            },
            {
              matrixGroup: "TrainStationLandmarkIds",
              size: 20,
            },
            {
              matrixGroup: "HotelChainId",
              size: 10,
            },
            {
              matrixGroup: "RecommendedByDestinationCity",
              size: 10,
            },
            {
              matrixGroup: "Deals",
              size: 100,
            },
          ],
          filterRequest: {
            idsFilters: [],
            rangeFilters: [],
            textFilters: [],
          },
          page: {
            pageSize: 45,
            pageNumber: 1,
            pageToken: "",
          },
          apoRequest: {
            apoPageSize: 10,
          },
          searchHistory: [],
          searchDetailRequest: {
            priceHistogramBins: 50,
          },
          isTrimmedResponseRequested: false,
          featuredAgodaHomesRequest: null,
          featuredLuxuryHotelsRequest: null,
          highlyRatedAgodaHomesRequest: {
            numberOfAgodaHomes: 30,
            minimumReviewScore: 7.5,
            minimumReviewCount: 3,
            accommodationTypes: [
              28, 29, 30, 102, 103, 106, 107, 108, 109, 110, 114, 115, 120, 131,
            ],
            sortVersion: 0,
          },
          extraAgodaHomesRequest: null,
          extraHotels: {
            extraHotelIds: [],
            enableFiltersForExtraHotels: false,
          },
          packaging: null,
          flexibleSearchRequest: {
            fromDate: new Date()
              .toLocaleDateString("en-in", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
              .split("/")
              .reverse()
              .join("-"),
            toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toLocaleDateString("en-in", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
              .split("/")
              .reverse()
              .join("-"),
            alternativeDateSize: 4,
            isFullFlexibleDateSearch: false,
          },
          rankingRequest: {
            isNhaKeywordSearch: false,
            isPulseRankingBoost: false,
          },
          rocketmilesRequestV2: null,
        },
      },
      ContentSummaryRequest: {
        context: {
          rawUserId: details.userId || "1d45a956-1222-4cd7-8a3e-6c4526075cc8",
          memberId: 0,
          userOrigin: "IN",
          locale: "en-gb",
          forceExperimentsByIdNew: [
            {
              key: "UMRAH-B2B",
              value: "B",
            },
            {
              key: "UMRAH-B2C-REGIONAL",
              value: "B",
            },
            {
              key: "UMRAH-B2C",
              value: "Z",
            },
            {
              key: "JGCW-204",
              value: "B",
            },
            {
              key: "JGCW-264",
              value: "B",
            },
            {
              key: "JGCW-202",
              value: "B",
            },
            {
              key: "JGCW-299",
              value: "B",
            },
            {
              key: "FD-3936",
              value: "B",
            },
          ],
          apo: false,
          searchCriteria: {
            cityId: 513298,
          },
          platform: {
            id: 1,
          },
          storeFrontId: 3,
          cid: "-999",
          occupancy: {
            numberOfAdults: 2,
            numberOfChildren: 0,
            travelerType: 2,
            checkIn: new Date(details.checkInDate),
          },
          deviceTypeId: 1,
          whiteLabelKey: "",
          correlationId: "",
        },
        summary: {
          highlightedFeaturesOrderPriority: null,
          description: false,
          includeHotelCharacter: true,
        },
        reviews: {
          commentary: null,
          demographics: {
            providerIds: null,
            filter: {
              defaultProviderOnly: true,
            },
          },
          summaries: {
            providerIds: null,
            apo: true,
            limit: 1,
            travellerType: 2,
          },
          cumulative: {
            providerIds: null,
          },
          filters: null,
        },
        images: {
          page: null,
          maxWidth: 0,
          maxHeight: 0,
          imageSizes: null,
          indexOffset: null,
        },
        rooms: {
          images: null,
          featureLimit: 0,
          filterCriteria: null,
          includeMissing: false,
          includeSoldOut: false,
          includeDmcRoomId: false,
          soldOutRoomCriteria: null,
          showRoomSize: true,
          showRoomFacilities: true,
        },
        nonHotelAccommodation: true,
        engagement: true,
        highlights: {
          maxNumberOfItems: 0,
          images: {
            imageSizes: [
              {
                key: "full",
                size: {
                  width: 0,
                  height: 0,
                },
              },
            ],
          },
        },
        personalizedInformation: false,
        localInformation: {
          images: null,
        },
        features: null,
        rateCategories: true,
        contentRateCategories: {
          escapeRateCategories: {},
        },
        synopsis: true,
      },
      PricingSummaryRequest: {
        cheapestOnly: true,
        context: {
          isAllowBookOnRequest: true,
          abTests: [
            {
              testId: 9021,
              abUser: "B",
            },
            {
              testId: 9023,
              abUser: "B",
            },
            {
              testId: 9024,
              abUser: "B",
            },
            {
              testId: 9025,
              abUser: "B",
            },
            {
              testId: 9027,
              abUser: "B",
            },
            {
              testId: 9029,
              abUser: "B",
            },
          ],
          clientInfo: {
            cid: -999,
            languageId: 1,
            languageUse: 1,
            origin: "IN",
            platform: 1,
            searchId: "96477b2b-256b-4a4c-b63d-2c9b586a6023",
            storefront: 3,
            userId: details.userId || "1d45a956-1222-4cd7-8a3e-6c4526075cc8",
          },
          experiment: [
            {
              name: "UMRAH-B2B",
              variant: "B",
            },
            {
              name: "UMRAH-B2C-REGIONAL",
              variant: "B",
            },
            {
              name: "UMRAH-B2C",
              variant: "Z",
            },
            {
              name: "JGCW-204",
              variant: "B",
            },
            {
              name: "JGCW-264",
              variant: "B",
            },
            {
              name: "JGCW-202",
              variant: "B",
            },
            {
              name: "JGCW-299",
              variant: "B",
            },
            {
              name: "FD-3936",
              variant: "B",
            },
          ],
          isDebug: false,
          sessionInfo: {
            isLogin: false,
            memberId: 0,
            sessionId: 1,
          },
          packaging: null,
        },
        isSSR: true,
        roomSortingStrategy: null,
        pricing: {
          bookingDate: new Date(),
          checkIn: new Date(details.checkInDate),
          checkout: new Date(details.checkOutDate),
          localCheckInDate: new Date(details.checkInDate)
            .toLocaleDateString("en-in")
            .split("/")
            .reverse()
            .join("-"),
          localCheckoutDate: new Date(details.checkOutDate)
            .toLocaleDateString("en-in")
            .split("/")
            .reverse()
            .join("-"),
          currency: "INR",
          details: {
            cheapestPriceOnly: false,
            itemBreakdown: false,
            priceBreakdown: false,
          },
          featureFlag: [
            "ClientDiscount",
            "PriceHistory",
            "VipPlatinum",
            "RatePlanPromosCumulative",
            "PromosCumulative",
            "CouponSellEx",
            "MixAndSave",
            "APSPeek",
            "StackChannelDiscount",
            "AutoApplyPromos",
            "EnableAgencySupplyForPackages",
            "EnableCashback",
            "CreditCardPromotionPeek",
            "DispatchGoLocalForInternational",
            "EnableGoToTravelCampaign",
          ],
          features: {
            crossOutRate: false,
            isAPSPeek: false,
            isAllOcc: false,
            isApsEnabled: false,
            isIncludeUsdAndLocalCurrency: false,
            isMSE: true,
            isRPM2Included: true,
            maxSuggestions: 0,
            isEnableSupplierFinancialInfo: false,
            isLoggingAuctionData: false,
            newRateModel: false,
            overrideOccupancy: false,
            filterCheapestRoomEscapesPackage: false,
            priusId: 0,
            synchronous: false,
            enableRichContentOffer: true,
            showCouponAmountInUserCurrency: false,
            disableEscapesPackage: false,
            enablePushDayUseRates: false,
            enableDayUseCor: false,
          },
          filters: {
            cheapestRoomFilters: [],
            filterAPO: false,
            ratePlans: [1],
            secretDealOnly: false,
            suppliers: [],
            nosOfBedrooms: [],
          },
          includedPriceInfo: false,
          occupancy: {
            adults: 2,
            children: 0,
            childAges: [],
            rooms: 1,
            childrenTypes: [],
          },
          supplierPullMetadata: {
            requiredPrecheckAccuracyLevel: 0,
          },
          mseHotelIds: [],
          ppLandingHotelIds: [],
          searchedHotelIds: [],
          paymentId: -999,
          externalLoyaltyRequest: null,
        },
        suggestedPrice: "Exclusive",
      },
      PriceStreamMetaLabRequest: {
        attributesId: [8, 1, 18, 7, 11, 2, 3],
      },
    },
    query:
      "query areaSearch($AreaSearchRequest: AreaSearchRequest!, $ContentSummaryRequest: ContentSummaryRequest!, $PricingSummaryRequest: PricingRequestParameters, $PriceStreamMetaLabRequest: PriceStreamMetaLabRequest) {\n  areaSearch(AreaSearchRequest: $AreaSearchRequest) {\n    searchResult {\n      sortMatrix {\n        result {\n          fieldId\n          sorting {\n            sortField\n            sortOrder\n            sortParams {\n              id\n            }\n          }\n          display {\n            name\n          }\n          childMatrix {\n            fieldId\n            sorting {\n              sortField\n              sortOrder\n              sortParams {\n                id\n              }\n            }\n            display {\n              name\n            }\n            childMatrix {\n              fieldId\n              sorting {\n                sortField\n                sortOrder\n                sortParams {\n                  id\n                }\n              }\n              display {\n                name\n              }\n            }\n          }\n        }\n      }\n      searchInfo {\n        flexibleSearch {\n          currentDate {\n            checkIn\n            price\n          }\n          alternativeDates {\n            checkIn\n            price\n          }\n        }\n        hasSecretDeal\n        isComplete\n        totalFilteredHotels\n        hasEscapesPackage\n        searchStatus {\n          searchCriteria {\n            checkIn\n          }\n          searchStatus\n        }\n        objectInfo {\n          objectName\n          cityName\n          cityEnglishName\n          countryId\n          countryEnglishName\n          mapLatitude\n          mapLongitude\n          mapZoomLevel\n          wlPreferredCityName\n          wlPreferredCountryName\n          cityId\n          cityCenterPolygon {\n            geoPoints {\n              lon\n              lat\n            }\n            touristAreaCenterPoint {\n              lon\n              lat\n            }\n          }\n        }\n      }\n      urgencyDetail {\n        urgencyScore\n      }\n      histogram {\n        bins {\n          numOfElements\n          upperBound {\n            perNightPerRoom\n            perPax\n          }\n        }\n      }\n      nhaProbability\n    }\n    properties(ContentSummaryRequest: $ContentSummaryRequest, PricingSummaryRequest: $PricingSummaryRequest, PriceStreamMetaLabRequest: $PriceStreamMetaLabRequest) {\n      propertyId\n      sponsoredDetail {\n        sponsoredType\n        trackingData\n        isShowSponsoredFlag\n      }\n      propertyResultType\n      content {\n        informationSummary {\n          hotelCharacter {\n            hotelTag {\n              name\n              symbol\n            }\n            hotelView {\n              name\n              symbol\n            }\n          }\n          propertyLinks {\n            propertyPage\n          }\n          atmospheres {\n            id\n            name\n          }\n          isSustainableTravel\n          localeName\n          defaultName\n          displayName\n          accommodationType\n          awardYear\n          hasHostExperience\n          address {\n            countryCode\n            country {\n              id\n              name\n            }\n            city {\n              id\n              name\n            }\n            area {\n              id\n              name\n            }\n          }\n          propertyType\n          rating\n          agodaGuaranteeProgram\n          remarks {\n            renovationInfo {\n              renovationType\n              year\n            }\n          }\n          spokenLanguages {\n            id\n          }\n          geoInfo {\n            latitude\n            longitude\n          }\n        }\n        propertyEngagement {\n          lastBooking\n          peopleLooking\n        }\n        nonHotelAccommodation {\n          masterRooms {\n            noOfBathrooms\n            noOfBedrooms\n            noOfBeds\n            roomSizeSqm\n            highlightedFacilities\n          }\n          hostLevel {\n            id\n            name\n          }\n          supportedLongStay\n        }\n        facilities {\n          id\n        }\n        images {\n          hotelImages {\n            id\n            caption\n            providerId\n            urls {\n              key\n              value\n            }\n          }\n        }\n        reviews {\n          contentReview {\n            isDefault\n            providerId\n            demographics {\n              groups {\n                id\n                grades {\n                  id\n                  score\n                }\n              }\n            }\n            summaries {\n              recommendationScores {\n                recommendationScore\n              }\n              snippets {\n                countryId\n                countryCode\n                countryName\n                date\n                demographicId\n                demographicName\n                reviewer\n                reviewRating\n                snippet\n              }\n            }\n            cumulative {\n              reviewCount\n              score\n            }\n          }\n          cumulative {\n            reviewCount\n            score\n          }\n        }\n        familyFeatures {\n          hasChildrenFreePolicy\n          isFamilyRoom\n          hasMoreThanOneBedroom\n          isInterConnectingRoom\n          isInfantCottageAvailable\n          hasKidsPool\n          hasKidsClub\n        }\n        personalizedInformation {\n          childrenFreePolicy {\n            fromAge\n            toAge\n          }\n        }\n        localInformation {\n          landmarks {\n            transportation {\n              landmarkName\n              distanceInM\n            }\n            topLandmark {\n              landmarkName\n              distanceInM\n            }\n            beach {\n              landmarkName\n              distanceInM\n            }\n          }\n          hasAirportTransfer\n        }\n        highlight {\n          cityCenter {\n            distanceFromCityCenter\n          }\n          favoriteFeatures {\n            features {\n              id\n              title\n              category\n            }\n          }\n          hasNearbyPublicTransportation\n        }\n        rateCategories {\n          escapeRateCategories {\n            rateCategoryId\n            localizedRateCategoryName\n          }\n        }\n      }\n      soldOut {\n        soldOutPrice {\n          averagePrice\n        }\n      }\n      pricing {\n        pulseCampaignMetadata {\n          promotionTypeId\n          webCampaignId\n          campaignTypeId\n          campaignBadgeText\n          campaignBadgeDescText\n          dealExpiryTime\n          showPulseMerchandise\n        }\n        isAvailable\n        isReady\n        benefits\n        cheapestRoomOffer {\n          agodaCash {\n            showBadge\n            giftcardGuid\n            dayToEarn\n            earnId\n            percentage\n            expiryDay\n          }\n          cashback {\n            cashbackGuid\n            showPostCashbackPrice\n            cashbackVersion\n            percentage\n            earnId\n            dayToEarn\n            expiryDay\n            cashbackType\n            appliedCampaignName\n          }\n        }\n        isEasyCancel\n        isInsiderDeal\n        suggestPriceType {\n          suggestPrice\n        }\n        roomBundle {\n          bundleId\n          bundleType\n          saveAmount {\n            perNight {\n              ...Fragh9a805394a6abcc2j728\n            }\n          }\n        }\n        pointmax {\n          channelId\n          point\n        }\n        priceChange {\n          changePercentage\n          searchDate\n        }\n        payment {\n          cancellation {\n            cancellationType\n            freeCancellationDate\n          }\n          payLater {\n            isEligible\n          }\n          payAtHotel {\n            isEligible\n          }\n          noCreditCard {\n            isEligible\n          }\n          taxReceipt {\n            isEligible\n          }\n        }\n        cheapestStayPackageRatePlans {\n          stayPackageType\n          ratePlanId\n        }\n        pricingMessages {\n          location\n          ids\n        }\n        suppliersSummaries {\n          id\n          supplierHotelId\n        }\n        supplierInfo {\n          id\n          name\n          isAgodaBand\n        }\n        offers {\n          roomOffers {\n            room {\n              extraPriceInfo {\n                displayPriceWithSurchargesPRPN\n                corDisplayPriceWithSurchargesPRPN\n              }\n              availableRooms\n              isPromoEligible\n              promotions {\n                typeId\n                promotionDiscount {\n                  value\n                }\n                isRatePlanAsPromotion\n                cmsTypeId\n                description\n              }\n              bookingDuration {\n                unit\n                value\n              }\n              supplierId\n              corSummary {\n                hasCor\n                corType\n                isOriginal\n                hasOwnCOR\n                isBlacklistedCor\n              }\n              localVoucher {\n                currencyCode\n                amount\n              }\n              pricing {\n                currency\n                price {\n                  perNight {\n                    exclusive {\n                      display\n                      cashbackPrice\n                      displayAfterCashback\n                      originalPrice\n                    }\n                    inclusive {\n                      display\n                      cashbackPrice\n                      displayAfterCashback\n                      originalPrice\n                    }\n                  }\n                  perBook {\n                    exclusive {\n                      display\n                      cashbackPrice\n                      displayAfterCashback\n                      rebatePrice\n                      originalPrice\n                      autoAppliedPromoDiscount\n                    }\n                    inclusive {\n                      display\n                      cashbackPrice\n                      displayAfterCashback\n                      rebatePrice\n                      originalPrice\n                      autoAppliedPromoDiscount\n                    }\n                  }\n                  perRoomPerNight {\n                    exclusive {\n                      display\n                      crossedOutPrice\n                      cashbackPrice\n                      displayAfterCashback\n                      rebatePrice\n                      pseudoCouponPrice\n                      originalPrice\n                    }\n                    inclusive {\n                      display\n                      crossedOutPrice\n                      cashbackPrice\n                      displayAfterCashback\n                      rebatePrice\n                      pseudoCouponPrice\n                      originalPrice\n                    }\n                  }\n                  totalDiscount\n                  priceAfterAppliedAgodaCash {\n                    perBook {\n                      ...Fragic4c6g6aj7216cc2jjd4\n                    }\n                    perRoomPerNight {\n                      ...Fragic4c6g6aj7216cc2jjd4\n                    }\n                  }\n                }\n                apsPeek {\n                  perRoomPerNight {\n                    ...Fragh9a805394a6abcc2j728\n                  }\n                }\n                promotionPricePeek {\n                  display {\n                    perBook {\n                      ...Fragh9a805394a6abcc2j728\n                    }\n                    perRoomPerNight {\n                      ...Fragh9a805394a6abcc2j728\n                    }\n                    perNight {\n                      ...Fragh9a805394a6abcc2j728\n                    }\n                  }\n                  discountType\n                  promotionCodeType\n                  promotionCode\n                  promoAppliedOnFinalPrice\n                  childPromotions {\n                    campaignId\n                  }\n                  campaignName\n                }\n                channelDiscountSummary {\n                  channelDiscountBreakdown {\n                    display\n                    discountPercent\n                    channelId\n                  }\n                }\n                promotionsCumulative {\n                  promotionCumulativeType\n                  amountPercentage\n                  minNightsStay\n                }\n              }\n              uid\n              payment {\n                cancellation {\n                  cancellationType\n                }\n              }\n              discount {\n                deals\n                channelDiscount\n              }\n              saveUpTo {\n                perRoomPerNight\n              }\n              benefits {\n                id\n                targetType\n              }\n              channel {\n                id\n              }\n              mseRoomSummaries {\n                supplierId\n                subSupplierId\n                pricingSummaries {\n                  currency\n                  channelDiscountSummary {\n                    channelDiscountBreakdown {\n                      channelId\n                      discountPercent\n                      display\n                    }\n                  }\n                  price {\n                    perRoomPerNight {\n                      exclusive {\n                        display\n                      }\n                      inclusive {\n                        display\n                      }\n                    }\n                  }\n                }\n              }\n              cashback {\n                cashbackGuid\n                showPostCashbackPrice\n                cashbackVersion\n                percentage\n                earnId\n                dayToEarn\n                expiryDay\n                cashbackType\n                appliedCampaignName\n              }\n              agodaCash {\n                showBadge\n                giftcardGuid\n                dayToEarn\n                expiryDay\n                percentage\n              }\n              corInfo {\n                corBreakdown {\n                  taxExPN {\n                    ...Fragi9027a2b40e837dg7gh9\n                  }\n                  taxInPN {\n                    ...Fragi9027a2b40e837dg7gh9\n                  }\n                  taxExPRPN {\n                    ...Fragi9027a2b40e837dg7gh9\n                  }\n                  taxInPRPN {\n                    ...Fragi9027a2b40e837dg7gh9\n                  }\n                }\n                corInfo {\n                  corType\n                }\n              }\n              loyaltyDisplay {\n                items\n              }\n              capacity {\n                extraBedsAvailable\n              }\n              pricingMessages {\n                formatted {\n                  location\n                  texts {\n                    index\n                    text\n                  }\n                }\n              }\n              campaign {\n                selected {\n                  messages {\n                    campaignName\n                    title\n                    titleWithDiscount\n                    description\n                    linkOutText\n                    url\n                  }\n                }\n              }\n              stayPackageType\n            }\n          }\n        }\n      }\n      metaLab {\n        attributes {\n          attributeId\n          dataType\n          value\n          version\n        }\n      }\n      enrichment {\n        topSellingPoint {\n          tspType\n          value\n        }\n        pricingBadges {\n          badges\n        }\n        uniqueSellingPoint {\n          rank\n          segment\n          uspType\n          uspPropertyType\n        }\n        bookingHistory {\n          bookingCount {\n            count\n            timeFrame\n          }\n        }\n        showReviewSnippet\n        isPopular\n        roomInformation {\n          cheapestRoomSizeSqm\n          facilities {\n            id\n            propertyFacilityName\n            symbol\n          }\n        }\n      }\n    }\n    searchEnrichment {\n      suppliersInformation {\n        supplierId\n        supplierName\n        isAgodaBand\n      }\n    }\n    aggregation {\n      matrixGroupResults {\n        matrixGroup\n        matrixItemResults {\n          id\n          name\n          count\n          filterKey\n          filterRequestType\n          extraDataResults {\n            text\n            matrixExtraDataType\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment Fragic4c6g6aj7216cc2jjd4 on DisplayPrice {\n  exclusive\n  allInclusive\n}\n\nfragment Fragh9a805394a6abcc2j728 on DFDisplayPrice {\n  exclusive\n  allInclusive\n}\n\nfragment Fragi9027a2b40e837dg7gh9 on DFCorBreakdownItem {\n  price\n  id\n}\n",
  };
};

module.exports = {
  queueTypes,
  allScrappersList,
  suggestionScrapperList,
  availableSortOptions,
  availableFilterOptions,
  filterTypes,
  offerScrappersList,
  offerScrapperQueueTypes,
  getAgodaCitySearchObj,
  getAgodaAreaSearchObj,
};
