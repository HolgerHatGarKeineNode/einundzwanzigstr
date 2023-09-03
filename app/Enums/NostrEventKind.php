<?php

namespace App\Enums;

use ArchTech\Enums\From;
use ArchTech\Enums\InvokableCases;
use ArchTech\Enums\Options;
use ArchTech\Enums\Values;

enum NostrEventKind: int
{
    use InvokableCases;
    use Values;
    use Options;
    use From;

    case metadata = 0;
    case text = 1;
    case recommendRelay = 2;
    case contacts = 3;
    case encryptedDirectMessage = 4;
    case eventDeletion = 5;
    case repost = 6;
    case reaction = 7;
    case badgeAward = 8;
    case genericRepost = 16;
    case channelCreation = 40;
    case channelMetadata = 41;
    case channelMessage = 42;
    case channelHideMessage = 43;
    case channelMuteUser = 44;
    case fileMetadata = 1063;
    case liveChatMessage = 1311;
    case report = 1984;
    case label = 1985;
    case zapRequest = 9734;
    case zap = 9735;
    case muteList = 10000;
    case pinList = 10001;
    case relayList = 10002;
    case walletInfo = 13194;
    case clientAuth = 22242;
    case walletRequest = 23194;
    case walletResponse = 23195;
    case nostrConnect = 24133;
    case httpAuth = 27235;
    case categorizedPeopleList = 30000;
    case categorizedBookmarkList = 30001;
    case profileBadges = 30008;
    case badgeDefinition = 30009;
    case marketplaceStall = 30017;
    case marketplaceProduct = 30018;
    case article = 30023;
    case draftArticle = 30024;
    case appSpecificData = 30078;
    case liveEvent = 30311;
    case classifiedListing = 30402;
    case draftClassifiedListing = 30403;
    case handlerRecommendation = 31989;
    case handlerInformation = 31990;
}
