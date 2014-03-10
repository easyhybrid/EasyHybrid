/**
 * Created by 清月_荷雾 on 14-3-3.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 *  网络相关工具
 *  @note 如果您需要使用代理来获取数据，并且使用"X-Forwarded-For"头来获取真实的URL，您可以简单的使用如下代码。
 *          window.devProxy = "http://xxxx"
 */

var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
    unwise = ['{', '}', '|', '\\', '^', '~', '`'].concat(delims),
    autoEscape = ['\''].concat(delims),
    nonHostChars = ['%', '/', '?', ';', '#'].concat(unwise).concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    slashedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'https:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
    },
    xhrSuccessStatus = {
        0: 200,
        1223: 204
    },
    host = null,//主域名
    protocols = {}, //自定义特殊的协议，以简化书写
    mime = {
        '123': 'application/vnd.lotus-1-2-3',
        ez: 'application/andrew-inset',
        aw: 'application/applixware',
        atom: 'application/atom+xml',
        atomcat: 'application/atomcat+xml',
        atomsvc: 'application/atomsvc+xml',
        ccxml: 'application/ccxml+xml',
        cdmia: 'application/cdmi-capability',
        cdmic: 'application/cdmi-container',
        cdmid: 'application/cdmi-domain',
        cdmio: 'application/cdmi-object',
        cdmiq: 'application/cdmi-queue',
        cu: 'application/cu-seeme',
        davmount: 'application/davmount+xml',
        dbk: 'application/docbook+xml',
        dssc: 'application/dssc+der',
        xdssc: 'application/dssc+xml',
        ecma: 'application/ecmascript',
        emma: 'application/emma+xml',
        epub: 'application/epub+zip',
        exi: 'application/exi',
        pfr: 'application/font-tdpfr',
        gml: 'application/gml+xml',
        gpx: 'application/gpx+xml',
        gxf: 'application/gxf',
        stk: 'application/hyperstudio',
        ink: 'application/inkml+xml',
        inkml: 'application/inkml+xml',
        ipfix: 'application/ipfix',
        jar: 'application/java-archive',
        ser: 'application/java-serialized-object',
        class: 'application/java-vm',
        js: 'application/javascript',
        json: 'application/json',
        jsonml: 'application/jsonml+json',
        lostxml: 'application/lost+xml',
        hqx: 'application/mac-binhex40',
        cpt: 'application/mac-compactpro',
        mads: 'application/mads+xml',
        mrc: 'application/marc',
        mrcx: 'application/marcxml+xml',
        ma: 'application/mathematica',
        nb: 'application/mathematica',
        mb: 'application/mathematica',
        mathml: 'application/mathml+xml',
        mbox: 'application/mbox',
        mscml: 'application/mediaservercontrol+xml',
        metalink: 'application/metalink+xml',
        meta4: 'application/metalink4+xml',
        mets: 'application/mets+xml',
        mods: 'application/mods+xml',
        m21: 'application/mp21',
        mp21: 'application/mp21',
        mp4s: 'application/mp4',
        doc: 'application/msword',
        dot: 'application/msword',
        mxf: 'application/mxf',
        bin: 'application/octet-stream',
        dms: 'application/octet-stream',
        lrf: 'application/octet-stream',
        mar: 'application/octet-stream',
        so: 'application/octet-stream',
        dist: 'application/octet-stream',
        distz: 'application/octet-stream',
        pkg: 'application/octet-stream',
        bpk: 'application/octet-stream',
        dump: 'application/octet-stream',
        elc: 'application/octet-stream',
        deploy: 'application/octet-stream',
        oda: 'application/oda',
        opf: 'application/oebps-package+xml',
        ogx: 'application/ogg',
        omdoc: 'application/omdoc+xml',
        onetoc: 'application/onenote',
        onetoc2: 'application/onenote',
        onetmp: 'application/onenote',
        onepkg: 'application/onenote',
        oxps: 'application/oxps',
        xer: 'application/patch-ops-error+xml',
        pdf: 'application/pdf',
        pgp: 'application/pgp-encrypted',
        asc: 'application/pgp-signature',
        sig: 'application/pgp-signature',
        prf: 'application/pics-rules',
        p10: 'application/pkcs10',
        p7m: 'application/pkcs7-mime',
        p7c: 'application/pkcs7-mime',
        p7s: 'application/pkcs7-signature',
        p8: 'application/pkcs8',
        ac: 'application/pkix-attr-cert',
        cer: 'application/pkix-cert',
        crl: 'application/pkix-crl',
        pkipath: 'application/pkix-pkipath',
        pki: 'application/pkixcmp',
        pls: 'application/pls+xml',
        ai: 'application/postscript',
        eps: 'application/postscript',
        ps: 'application/postscript',
        cww: 'application/prs.cww',
        pskcxml: 'application/pskc+xml',
        rdf: 'application/rdf+xml',
        rif: 'application/reginfo+xml',
        rnc: 'application/relax-ng-compact-syntax',
        rl: 'application/resource-lists+xml',
        rld: 'application/resource-lists-diff+xml',
        rs: 'application/rls-services+xml',
        gbr: 'application/rpki-ghostbusters',
        mft: 'application/rpki-manifest',
        roa: 'application/rpki-roa',
        rsd: 'application/rsd+xml',
        rss: 'application/rss+xml',
        rtf: 'application/rtf',
        sbml: 'application/sbml+xml',
        scq: 'application/scvp-cv-request',
        scs: 'application/scvp-cv-response',
        spq: 'application/scvp-vp-request',
        spp: 'application/scvp-vp-response',
        sdp: 'application/sdp',
        setpay: 'application/set-payment-initiation',
        setreg: 'application/set-registration-initiation',
        shf: 'application/shf+xml',
        smi: 'application/smil+xml',
        smil: 'application/smil+xml',
        rq: 'application/sparql-query',
        srx: 'application/sparql-results+xml',
        gram: 'application/srgs',
        grxml: 'application/srgs+xml',
        sru: 'application/sru+xml',
        ssdl: 'application/ssdl+xml',
        ssml: 'application/ssml+xml',
        tei: 'application/tei+xml',
        teicorpus: 'application/tei+xml',
        tfi: 'application/thraud+xml',
        tsd: 'application/timestamped-data',
        plb: 'application/vnd.3gpp.pic-bw-large',
        psb: 'application/vnd.3gpp.pic-bw-small',
        pvb: 'application/vnd.3gpp.pic-bw-var',
        tcap: 'application/vnd.3gpp2.tcap',
        pwn: 'application/vnd.3m.post-it-notes',
        aso: 'application/vnd.accpac.simply.aso',
        imp: 'application/vnd.accpac.simply.imp',
        acu: 'application/vnd.acucobol',
        atc: 'application/vnd.acucorp',
        acutc: 'application/vnd.acucorp',
        air: 'application/vnd.adobe.air-application-installer-package+zip',
        fcdt: 'application/vnd.adobe.formscentral.fcdt',
        fxp: 'application/vnd.adobe.fxp',
        fxpl: 'application/vnd.adobe.fxp',
        xdp: 'application/vnd.adobe.xdp+xml',
        xfdf: 'application/vnd.adobe.xfdf',
        ahead: 'application/vnd.ahead.space',
        azf: 'application/vnd.airzip.filesecure.azf',
        azs: 'application/vnd.airzip.filesecure.azs',
        azw: 'application/vnd.amazon.ebook',
        acc: 'application/vnd.americandynamics.acc',
        ami: 'application/vnd.amiga.ami',
        apk: 'application/vnd.android.package-archive',
        cii: 'application/vnd.anser-web-certificate-issue-initiation',
        fti: 'application/vnd.anser-web-funds-transfer-initiation',
        atx: 'application/vnd.antix.game-component',
        mpkg: 'application/vnd.apple.installer+xml',
        m3u8: 'application/vnd.apple.mpegurl',
        swi: 'application/vnd.aristanetworks.swi',
        iota: 'application/vnd.astraea-software.iota',
        aep: 'application/vnd.audiograph',
        mpm: 'application/vnd.blueice.multipass',
        bmi: 'application/vnd.bmi',
        rep: 'application/vnd.businessobjects',
        cdxml: 'application/vnd.chemdraw+xml',
        mmd: 'application/vnd.chipnuts.karaoke-mmd',
        cdy: 'application/vnd.cinderella',
        cla: 'application/vnd.claymore',
        rp9: 'application/vnd.cloanto.rp9',
        c4g: 'application/vnd.clonk.c4group',
        c4d: 'application/vnd.clonk.c4group',
        c4f: 'application/vnd.clonk.c4group',
        c4p: 'application/vnd.clonk.c4group',
        c4u: 'application/vnd.clonk.c4group',
        c11amc: 'application/vnd.cluetrust.cartomobile-config',
        c11amz: 'application/vnd.cluetrust.cartomobile-config-pkg',
        csp: 'application/vnd.commonspace',
        cdbcmsg: 'application/vnd.contact.cmsg',
        cmc: 'application/vnd.cosmocaller',
        clkx: 'application/vnd.crick.clicker',
        clkk: 'application/vnd.crick.clicker.keyboard',
        clkp: 'application/vnd.crick.clicker.palette',
        clkt: 'application/vnd.crick.clicker.template',
        clkw: 'application/vnd.crick.clicker.wordbank',
        wbs: 'application/vnd.criticaltools.wbs+xml',
        pml: 'application/vnd.ctc-posml',
        ppd: 'application/vnd.cups-ppd',
        car: 'application/vnd.curl.car',
        pcurl: 'application/vnd.curl.pcurl',
        dart: 'application/vnd.dart',
        rdz: 'application/vnd.data-vision.rdz',
        uvf: 'application/vnd.dece.data',
        uvvf: 'application/vnd.dece.data',
        uvd: 'application/vnd.dece.data',
        uvvd: 'application/vnd.dece.data',
        uvt: 'application/vnd.dece.ttml+xml',
        uvvt: 'application/vnd.dece.ttml+xml',
        uvx: 'application/vnd.dece.unspecified',
        uvvx: 'application/vnd.dece.unspecified',
        uvz: 'application/vnd.dece.zip',
        uvvz: 'application/vnd.dece.zip',
        fe_launch: 'application/vnd.denovo.fcselayout-link',
        dna: 'application/vnd.dna',
        mlp: 'application/vnd.dolby.mlp',
        dpg: 'application/vnd.dpgraph',
        dfac: 'application/vnd.dreamfactory',
        kpxx: 'application/vnd.ds-keypoint',
        ait: 'application/vnd.dvb.ait',
        svc: 'application/vnd.dvb.service',
        geo: 'application/vnd.dynageo',
        mag: 'application/vnd.ecowin.chart',
        nml: 'application/vnd.enliven',
        esf: 'application/vnd.epson.esf',
        msf: 'application/vnd.epson.msf',
        qam: 'application/vnd.epson.quickanime',
        slt: 'application/vnd.epson.salt',
        ssf: 'application/vnd.epson.ssf',
        es3: 'application/vnd.eszigno3+xml',
        et3: 'application/vnd.eszigno3+xml',
        ez2: 'application/vnd.ezpix-album',
        ez3: 'application/vnd.ezpix-package',
        fdf: 'application/vnd.fdf',
        mseed: 'application/vnd.fdsn.mseed',
        seed: 'application/vnd.fdsn.seed',
        dataless: 'application/vnd.fdsn.seed',
        gph: 'application/vnd.flographit',
        ftc: 'application/vnd.fluxtime.clip',
        fm: 'application/vnd.framemaker',
        frame: 'application/vnd.framemaker',
        maker: 'application/vnd.framemaker',
        book: 'application/vnd.framemaker',
        fnc: 'application/vnd.frogans.fnc',
        ltf: 'application/vnd.frogans.ltf',
        fsc: 'application/vnd.fsc.weblaunch',
        oas: 'application/vnd.fujitsu.oasys',
        oa2: 'application/vnd.fujitsu.oasys2',
        oa3: 'application/vnd.fujitsu.oasys3',
        fg5: 'application/vnd.fujitsu.oasysgp',
        bh2: 'application/vnd.fujitsu.oasysprs',
        ddd: 'application/vnd.fujixerox.ddd',
        xdw: 'application/vnd.fujixerox.docuworks',
        xbd: 'application/vnd.fujixerox.docuworks.binder',
        fzs: 'application/vnd.fuzzysheet',
        txd: 'application/vnd.genomatix.tuxedo',
        ggb: 'application/vnd.geogebra.file',
        ggt: 'application/vnd.geogebra.tool',
        gex: 'application/vnd.geometry-explorer',
        gre: 'application/vnd.geometry-explorer',
        gxt: 'application/vnd.geonext',
        g2w: 'application/vnd.geoplan',
        g3w: 'application/vnd.geospace',
        gmx: 'application/vnd.gmx',
        kml: 'application/vnd.google-earth.kml+xml',
        kmz: 'application/vnd.google-earth.kmz',
        gqf: 'application/vnd.grafeq',
        gqs: 'application/vnd.grafeq',
        gac: 'application/vnd.groove-account',
        ghf: 'application/vnd.groove-help',
        gim: 'application/vnd.groove-identity-message',
        grv: 'application/vnd.groove-injector',
        gtm: 'application/vnd.groove-tool-message',
        tpl: 'application/vnd.groove-tool-template',
        vcg: 'application/vnd.groove-vcard',
        hal: 'application/vnd.hal+xml',
        zmm: 'application/vnd.handheld-entertainment+xml',
        hbci: 'application/vnd.hbci',
        les: 'application/vnd.hhe.lesson-player',
        hpgl: 'application/vnd.hp-hpgl',
        hpid: 'application/vnd.hp-hpid',
        hps: 'application/vnd.hp-hps',
        jlt: 'application/vnd.hp-jlyt',
        pcl: 'application/vnd.hp-pcl',
        pclxl: 'application/vnd.hp-pclxl',
        'sfd-hdstx': 'application/vnd.hydrostatix.sof-data',
        mpy: 'application/vnd.ibm.minipay',
        afp: 'application/vnd.ibm.modcap',
        listafp: 'application/vnd.ibm.modcap',
        list3820: 'application/vnd.ibm.modcap',
        irm: 'application/vnd.ibm.rights-management',
        sc: 'application/vnd.ibm.secure-container',
        icc: 'application/vnd.iccprofile',
        icm: 'application/vnd.iccprofile',
        igl: 'application/vnd.igloader',
        ivp: 'application/vnd.immervision-ivp',
        ivu: 'application/vnd.immervision-ivu',
        igm: 'application/vnd.insors.igm',
        xpw: 'application/vnd.intercon.formnet',
        xpx: 'application/vnd.intercon.formnet',
        i2g: 'application/vnd.intergeo',
        qbo: 'application/vnd.intu.qbo',
        qfx: 'application/vnd.intu.qfx',
        rcprofile: 'application/vnd.ipunplugged.rcprofile',
        irp: 'application/vnd.irepository.package+xml',
        xpr: 'application/vnd.is-xpr',
        fcs: 'application/vnd.isac.fcs',
        jam: 'application/vnd.jam',
        rms: 'application/vnd.jcp.javame.midlet-rms',
        jisp: 'application/vnd.jisp',
        joda: 'application/vnd.joost.joda-archive',
        ktz: 'application/vnd.kahootz',
        ktr: 'application/vnd.kahootz',
        karbon: 'application/vnd.kde.karbon',
        chrt: 'application/vnd.kde.kchart',
        kfo: 'application/vnd.kde.kformula',
        flw: 'application/vnd.kde.kivio',
        kon: 'application/vnd.kde.kontour',
        kpr: 'application/vnd.kde.kpresenter',
        kpt: 'application/vnd.kde.kpresenter',
        ksp: 'application/vnd.kde.kspread',
        kwd: 'application/vnd.kde.kword',
        kwt: 'application/vnd.kde.kword',
        htke: 'application/vnd.kenameaapp',
        kia: 'application/vnd.kidspiration',
        kne: 'application/vnd.kinar',
        knp: 'application/vnd.kinar',
        skp: 'application/vnd.koan',
        skd: 'application/vnd.koan',
        skt: 'application/vnd.koan',
        skm: 'application/vnd.koan',
        sse: 'application/vnd.kodak-descriptor',
        lasxml: 'application/vnd.las.las+xml',
        lbd: 'application/vnd.llamagraphics.life-balance.desktop',
        lbe: 'application/vnd.llamagraphics.life-balance.exchange+xml',
        apr: 'application/vnd.lotus-approach',
        pre: 'application/vnd.lotus-freelance',
        nsf: 'application/vnd.lotus-notes',
        org: 'application/vnd.lotus-organizer',
        scm: 'application/vnd.lotus-screencam',
        lwp: 'application/vnd.lotus-wordpro',
        portpkg: 'application/vnd.macports.portpkg',
        mcd: 'application/vnd.mcd',
        mc1: 'application/vnd.medcalcdata',
        cdkey: 'application/vnd.mediastation.cdkey',
        mwf: 'application/vnd.mfer',
        mfm: 'application/vnd.mfmp',
        flo: 'application/vnd.micrografx.flo',
        igx: 'application/vnd.micrografx.igx',
        mif: 'application/vnd.mif',
        daf: 'application/vnd.mobius.daf',
        dis: 'application/vnd.mobius.dis',
        mbk: 'application/vnd.mobius.mbk',
        mqy: 'application/vnd.mobius.mqy',
        msl: 'application/vnd.mobius.msl',
        plc: 'application/vnd.mobius.plc',
        txf: 'application/vnd.mobius.txf',
        mpn: 'application/vnd.mophun.application',
        mpc: 'application/vnd.mophun.certificate',
        xul: 'application/vnd.mozilla.xul+xml',
        cil: 'application/vnd.ms-artgalry',
        cab: 'application/vnd.ms-cab-compressed',
        xls: 'application/vnd.ms-excel',
        xlm: 'application/vnd.ms-excel',
        xla: 'application/vnd.ms-excel',
        xlc: 'application/vnd.ms-excel',
        xlt: 'application/vnd.ms-excel',
        xlw: 'application/vnd.ms-excel',
        xlam: 'application/vnd.ms-excel.addin.macroenabled.12',
        xlsb: 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
        xlsm: 'application/vnd.ms-excel.sheet.macroenabled.12',
        xltm: 'application/vnd.ms-excel.template.macroenabled.12',
        eot: 'application/vnd.ms-fontobject',
        chm: 'application/vnd.ms-htmlhelp',
        ims: 'application/vnd.ms-ims',
        lrm: 'application/vnd.ms-lrm',
        thmx: 'application/vnd.ms-officetheme',
        cat: 'application/vnd.ms-pki.seccat',
        stl: 'application/vnd.ms-pki.stl',
        ppt: 'application/vnd.ms-powerpoint',
        pps: 'application/vnd.ms-powerpoint',
        pot: 'application/vnd.ms-powerpoint',
        ppam: 'application/vnd.ms-powerpoint.addin.macroenabled.12',
        pptm: 'application/vnd.ms-powerpoint.presentation.macroenabled.12',
        sldm: 'application/vnd.ms-powerpoint.slide.macroenabled.12',
        ppsm: 'application/vnd.ms-powerpoint.slideshow.macroenabled.12',
        potm: 'application/vnd.ms-powerpoint.template.macroenabled.12',
        mpp: 'application/vnd.ms-project',
        mpt: 'application/vnd.ms-project',
        docm: 'application/vnd.ms-word.document.macroenabled.12',
        dotm: 'application/vnd.ms-word.template.macroenabled.12',
        wps: 'application/vnd.ms-works',
        wks: 'application/vnd.ms-works',
        wcm: 'application/vnd.ms-works',
        wdb: 'application/vnd.ms-works',
        wpl: 'application/vnd.ms-wpl',
        xps: 'application/vnd.ms-xpsdocument',
        mseq: 'application/vnd.mseq',
        mus: 'application/vnd.musician',
        msty: 'application/vnd.muvee.style',
        taglet: 'application/vnd.mynfc',
        nlu: 'application/vnd.neurolanguage.nlu',
        ntf: 'application/vnd.nitf',
        nitf: 'application/vnd.nitf',
        nnd: 'application/vnd.noblenet-directory',
        nns: 'application/vnd.noblenet-sealer',
        nnw: 'application/vnd.noblenet-web',
        ngdat: 'application/vnd.nokia.n-gage.data',
        'n-gage': 'application/vnd.nokia.n-gage.symbian.install',
        rpst: 'application/vnd.nokia.radio-preset',
        rpss: 'application/vnd.nokia.radio-presets',
        edm: 'application/vnd.novadigm.edm',
        edx: 'application/vnd.novadigm.edx',
        ext: 'application/vnd.novadigm.ext',
        odc: 'application/vnd.oasis.opendocument.chart',
        otc: 'application/vnd.oasis.opendocument.chart-template',
        odb: 'application/vnd.oasis.opendocument.database',
        odf: 'application/vnd.oasis.opendocument.formula',
        odft: 'application/vnd.oasis.opendocument.formula-template',
        odg: 'application/vnd.oasis.opendocument.graphics',
        otg: 'application/vnd.oasis.opendocument.graphics-template',
        odi: 'application/vnd.oasis.opendocument.image',
        oti: 'application/vnd.oasis.opendocument.image-template',
        odp: 'application/vnd.oasis.opendocument.presentation',
        otp: 'application/vnd.oasis.opendocument.presentation-template',
        ods: 'application/vnd.oasis.opendocument.spreadsheet',
        ots: 'application/vnd.oasis.opendocument.spreadsheet-template',
        odt: 'application/vnd.oasis.opendocument.text',
        odm: 'application/vnd.oasis.opendocument.text-master',
        ott: 'application/vnd.oasis.opendocument.text-template',
        oth: 'application/vnd.oasis.opendocument.text-web',
        xo: 'application/vnd.olpc-sugar',
        dd2: 'application/vnd.oma.dd2+xml',
        oxt: 'application/vnd.openofficeorg.extension',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        sldx: 'application/vnd.openxmlformats-officedocument.presentationml.slide',
        ppsx: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
        potx: 'application/vnd.openxmlformats-officedocument.presentationml.template',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
        mgp: 'application/vnd.osgeo.mapguide.package',
        dp: 'application/vnd.osgi.dp',
        esa: 'application/vnd.osgi.subsystem',
        pdb: 'application/vnd.palm',
        pqa: 'application/vnd.palm',
        oprc: 'application/vnd.palm',
        paw: 'application/vnd.pawaafile',
        str: 'application/vnd.pg.format',
        ei6: 'application/vnd.pg.osasli',
        efif: 'application/vnd.picsel',
        wg: 'application/vnd.pmi.widget',
        plf: 'application/vnd.pocketlearn',
        pbd: 'application/vnd.powerbuilder6',
        box: 'application/vnd.previewsystems.box',
        mgz: 'application/vnd.proteus.magazine',
        qps: 'application/vnd.publishare-delta-tree',
        ptid: 'application/vnd.pvi.ptid1',
        qxd: 'application/vnd.quark.quarkxpress',
        qxt: 'application/vnd.quark.quarkxpress',
        qwd: 'application/vnd.quark.quarkxpress',
        qwt: 'application/vnd.quark.quarkxpress',
        qxl: 'application/vnd.quark.quarkxpress',
        qxb: 'application/vnd.quark.quarkxpress',
        bed: 'application/vnd.realvnc.bed',
        mxl: 'application/vnd.recordare.musicxml',
        musicxml: 'application/vnd.recordare.musicxml+xml',
        cryptonote: 'application/vnd.rig.cryptonote',
        cod: 'application/vnd.rim.cod',
        rm: 'application/vnd.rn-realmedia',
        rmvb: 'application/vnd.rn-realmedia-vbr',
        link66: 'application/vnd.route66.link66+xml',
        st: 'application/vnd.sailingtracker.track',
        see: 'application/vnd.seemail',
        sema: 'application/vnd.sema',
        semd: 'application/vnd.semd',
        semf: 'application/vnd.semf',
        ifm: 'application/vnd.shana.informed.formdata',
        itp: 'application/vnd.shana.informed.formtemplate',
        iif: 'application/vnd.shana.informed.interchange',
        ipk: 'application/vnd.shana.informed.package',
        twd: 'application/vnd.simtech-mindmapper',
        twds: 'application/vnd.simtech-mindmapper',
        mmf: 'application/vnd.smaf',
        teacher: 'application/vnd.smart.teacher',
        sdkm: 'application/vnd.solent.sdkm+xml',
        sdkd: 'application/vnd.solent.sdkm+xml',
        dxp: 'application/vnd.spotfire.dxp',
        sfs: 'application/vnd.spotfire.sfs',
        sdc: 'application/vnd.stardivision.calc',
        sda: 'application/vnd.stardivision.draw',
        sdd: 'application/vnd.stardivision.impress',
        smf: 'application/vnd.stardivision.math',
        sdw: 'application/vnd.stardivision.writer',
        vor: 'application/vnd.stardivision.writer',
        sgl: 'application/vnd.stardivision.writer-global',
        smzip: 'application/vnd.stepmania.package',
        sm: 'application/vnd.stepmania.stepchart',
        sxc: 'application/vnd.sun.xml.calc',
        stc: 'application/vnd.sun.xml.calc.template',
        sxd: 'application/vnd.sun.xml.draw',
        std: 'application/vnd.sun.xml.draw.template',
        sxi: 'application/vnd.sun.xml.impress',
        sti: 'application/vnd.sun.xml.impress.template',
        sxm: 'application/vnd.sun.xml.math',
        sxw: 'application/vnd.sun.xml.writer',
        sxg: 'application/vnd.sun.xml.writer.global',
        stw: 'application/vnd.sun.xml.writer.template',
        sus: 'application/vnd.sus-calendar',
        susp: 'application/vnd.sus-calendar',
        svd: 'application/vnd.svd',
        sis: 'application/vnd.symbian.install',
        sisx: 'application/vnd.symbian.install',
        xsm: 'application/vnd.syncml+xml',
        bdm: 'application/vnd.syncml.dm+wbxml',
        xdm: 'application/vnd.syncml.dm+xml',
        tao: 'application/vnd.tao.intent-module-archive',
        pcap: 'application/vnd.tcpdump.pcap',
        cap: 'application/vnd.tcpdump.pcap',
        dmp: 'application/vnd.tcpdump.pcap',
        tmo: 'application/vnd.tmobile-livetv',
        tpt: 'application/vnd.trid.tpt',
        mxs: 'application/vnd.triscape.mxs',
        tra: 'application/vnd.trueapp',
        ufd: 'application/vnd.ufdl',
        ufdl: 'application/vnd.ufdl',
        utz: 'application/vnd.uiq.theme',
        umj: 'application/vnd.umajin',
        unityweb: 'application/vnd.unity',
        uoml: 'application/vnd.uoml+xml',
        vcx: 'application/vnd.vcx',
        vsd: 'application/vnd.visio',
        vst: 'application/vnd.visio',
        vss: 'application/vnd.visio',
        vsw: 'application/vnd.visio',
        vis: 'application/vnd.visionary',
        vsf: 'application/vnd.vsf',
        wbxml: 'application/vnd.wap.wbxml',
        wmlc: 'application/vnd.wap.wmlc',
        wmlsc: 'application/vnd.wap.wmlscriptc',
        wtb: 'application/vnd.webturbo',
        nbp: 'application/vnd.wolfram.player',
        wpd: 'application/vnd.wordperfect',
        wqd: 'application/vnd.wqd',
        stf: 'application/vnd.wt.stf',
        xar: 'application/vnd.xara',
        xfdl: 'application/vnd.xfdl',
        hvd: 'application/vnd.yamaha.hv-dic',
        hvs: 'application/vnd.yamaha.hv-script',
        hvp: 'application/vnd.yamaha.hv-voice',
        osf: 'application/vnd.yamaha.openscoreformat',
        osfpvg: 'application/vnd.yamaha.openscoreformat.osfpvg+xml',
        saf: 'application/vnd.yamaha.smaf-audio',
        spf: 'application/vnd.yamaha.smaf-phrase',
        cmp: 'application/vnd.yellowriver-custom-menu',
        zir: 'application/vnd.zul',
        zirz: 'application/vnd.zul',
        zaz: 'application/vnd.zzazz.deck+xml',
        vxml: 'application/voicexml+xml',
        wgt: 'application/widget',
        hlp: 'application/winhlp',
        wsdl: 'application/wsdl+xml',
        wspolicy: 'application/wspolicy+xml',
        '7z': 'application/x-7z-compressed',
        abw: 'application/x-abiword',
        ace: 'application/x-ace-compressed',
        dmg: 'application/x-apple-diskimage',
        aab: 'application/x-authorware-bin',
        x32: 'application/x-authorware-bin',
        u32: 'application/x-authorware-bin',
        vox: 'application/x-authorware-bin',
        aam: 'application/x-authorware-map',
        aas: 'application/x-authorware-seg',
        bcpio: 'application/x-bcpio',
        torrent: 'application/x-bittorrent',
        blb: 'application/x-blorb',
        blorb: 'application/x-blorb',
        bz: 'application/x-bzip',
        bz2: 'application/x-bzip2',
        boz: 'application/x-bzip2',
        cbr: 'application/x-cbr',
        cba: 'application/x-cbr',
        cbt: 'application/x-cbr',
        cbz: 'application/x-cbr',
        cb7: 'application/x-cbr',
        vcd: 'application/x-cdlink',
        cfs: 'application/x-cfs-compressed',
        chat: 'application/x-chat',
        pgn: 'application/x-chess-pgn',
        nsc: 'application/x-conference',
        cpio: 'application/x-cpio',
        csh: 'application/x-csh',
        deb: 'application/x-debian-package',
        udeb: 'application/x-debian-package',
        dgc: 'application/x-dgc-compressed',
        dir: 'application/x-director',
        dcr: 'application/x-director',
        dxr: 'application/x-director',
        cst: 'application/x-director',
        cct: 'application/x-director',
        cxt: 'application/x-director',
        w3d: 'application/x-director',
        fgd: 'application/x-director',
        swa: 'application/x-director',
        wad: 'application/x-doom',
        ncx: 'application/x-dtbncx+xml',
        dtb: 'application/x-dtbook+xml',
        res: 'application/x-dtbresource+xml',
        dvi: 'application/x-dvi',
        evy: 'application/x-envoy',
        eva: 'application/x-eva',
        bdf: 'application/x-font-bdf',
        gsf: 'application/x-font-ghostscript',
        psf: 'application/x-font-linux-psf',
        otf: 'font/opentype',
        pcf: 'application/x-font-pcf',
        snf: 'application/x-font-snf',
        ttf: 'application/x-font-ttf',
        ttc: 'application/x-font-ttf',
        pfa: 'application/x-font-type1',
        pfb: 'application/x-font-type1',
        pfm: 'application/x-font-type1',
        afm: 'application/x-font-type1',
        woff: 'application/font-woff',
        arc: 'application/x-freearc',
        spl: 'application/x-futuresplash',
        gca: 'application/x-gca-compressed',
        ulx: 'application/x-glulx',
        gnumeric: 'application/x-gnumeric',
        gramps: 'application/x-gramps-xml',
        gtar: 'application/x-gtar',
        hdf: 'application/x-hdf',
        install: 'application/x-install-instructions',
        iso: 'application/x-iso9660-image',
        jnlp: 'application/x-java-jnlp-file',
        latex: 'application/x-latex',
        lzh: 'application/x-lzh-compressed',
        lha: 'application/x-lzh-compressed',
        mie: 'application/x-mie',
        prc: 'application/x-mobipocket-ebook',
        mobi: 'application/x-mobipocket-ebook',
        application: 'application/x-ms-application',
        lnk: 'application/x-ms-shortcut',
        wmd: 'application/x-ms-wmd',
        wmz: 'application/x-msmetafile',
        xbap: 'application/x-ms-xbap',
        mdb: 'application/x-msaccess',
        obd: 'application/x-msbinder',
        crd: 'application/x-mscardfile',
        clp: 'application/x-msclip',
        exe: 'application/x-msdownload',
        dll: 'application/x-msdownload',
        com: 'application/x-msdownload',
        bat: 'application/x-msdownload',
        msi: 'application/x-msdownload',
        mvb: 'application/x-msmediaview',
        m13: 'application/x-msmediaview',
        m14: 'application/x-msmediaview',
        wmf: 'application/x-msmetafile',
        emf: 'application/x-msmetafile',
        emz: 'application/x-msmetafile',
        mny: 'application/x-msmoney',
        pub: 'application/x-mspublisher',
        scd: 'application/x-msschedule',
        trm: 'application/x-msterminal',
        wri: 'application/x-mswrite',
        nc: 'application/x-netcdf',
        cdf: 'application/x-netcdf',
        nzb: 'application/x-nzb',
        p12: 'application/x-pkcs12',
        pfx: 'application/x-pkcs12',
        p7b: 'application/x-pkcs7-certificates',
        spc: 'application/x-pkcs7-certificates',
        p7r: 'application/x-pkcs7-certreqresp',
        rar: 'application/x-rar-compressed',
        ris: 'application/x-research-info-systems',
        sh: 'application/x-sh',
        shar: 'application/x-shar',
        swf: 'application/x-shockwave-flash',
        xap: 'application/x-silverlight-app',
        sql: 'application/x-sql',
        sit: 'application/x-stuffit',
        sitx: 'application/x-stuffitx',
        srt: 'application/x-subrip',
        sv4cpio: 'application/x-sv4cpio',
        sv4crc: 'application/x-sv4crc',
        t3: 'application/x-t3vm-image',
        gam: 'application/x-tads',
        tar: 'application/x-tar',
        tcl: 'application/x-tcl',
        tex: 'application/x-tex',
        tfm: 'application/x-tex-tfm',
        texinfo: 'application/x-texinfo',
        texi: 'application/x-texinfo',
        obj: 'application/x-tgif',
        ustar: 'application/x-ustar',
        src: 'application/x-wais-source',
        der: 'application/x-x509-ca-cert',
        crt: 'application/x-x509-ca-cert',
        fig: 'application/x-xfig',
        xlf: 'application/x-xliff+xml',
        xpi: 'application/x-xpinstall',
        xz: 'application/x-xz',
        z1: 'application/x-zmachine',
        z2: 'application/x-zmachine',
        z3: 'application/x-zmachine',
        z4: 'application/x-zmachine',
        z5: 'application/x-zmachine',
        z6: 'application/x-zmachine',
        z7: 'application/x-zmachine',
        z8: 'application/x-zmachine',
        xaml: 'application/xaml+xml',
        xdf: 'application/xcap-diff+xml',
        xenc: 'application/xenc+xml',
        xhtml: 'application/xhtml+xml',
        xht: 'application/xhtml+xml',
        xml: 'application/xml',
        xsl: 'application/xml',
        dtd: 'application/xml-dtd',
        xop: 'application/xop+xml',
        xpl: 'application/xproc+xml',
        xslt: 'application/xslt+xml',
        xspf: 'application/xspf+xml',
        mxml: 'application/xv+xml',
        xhvml: 'application/xv+xml',
        xvml: 'application/xv+xml',
        xvm: 'application/xv+xml',
        yang: 'application/yang',
        yin: 'application/yin+xml',
        zip: 'application/zip',
        adp: 'audio/adpcm',
        au: 'audio/basic',
        snd: 'audio/basic',
        mid: 'audio/midi',
        midi: 'audio/midi',
        kar: 'audio/midi',
        rmi: 'audio/midi',
        mp4a: 'audio/mp4',
        mpga: 'audio/mpeg',
        mp2: 'audio/mpeg',
        mp2a: 'audio/mpeg',
        mp3: 'audio/mpeg',
        m2a: 'audio/mpeg',
        m3a: 'audio/mpeg',
        oga: 'audio/ogg',
        ogg: 'audio/ogg',
        spx: 'audio/ogg',
        s3m: 'audio/s3m',
        sil: 'audio/silk',
        uva: 'audio/vnd.dece.audio',
        uvva: 'audio/vnd.dece.audio',
        eol: 'audio/vnd.digital-winds',
        dra: 'audio/vnd.dra',
        dts: 'audio/vnd.dts',
        dtshd: 'audio/vnd.dts.hd',
        lvp: 'audio/vnd.lucent.voice',
        pya: 'audio/vnd.ms-playready.media.pya',
        ecelp4800: 'audio/vnd.nuera.ecelp4800',
        ecelp7470: 'audio/vnd.nuera.ecelp7470',
        ecelp9600: 'audio/vnd.nuera.ecelp9600',
        rip: 'audio/vnd.rip',
        weba: 'audio/webm',
        aac: 'audio/x-aac',
        aif: 'audio/x-aiff',
        aiff: 'audio/x-aiff',
        aifc: 'audio/x-aiff',
        caf: 'audio/x-caf',
        flac: 'audio/x-flac',
        mka: 'audio/x-matroska',
        m3u: 'audio/x-mpegurl',
        wax: 'audio/x-ms-wax',
        wma: 'audio/x-ms-wma',
        ram: 'audio/x-pn-realaudio',
        ra: 'audio/x-pn-realaudio',
        rmp: 'audio/x-pn-realaudio-plugin',
        wav: 'audio/x-wav',
        xm: 'audio/xm',
        cdx: 'chemical/x-cdx',
        cif: 'chemical/x-cif',
        cmdf: 'chemical/x-cmdf',
        cml: 'chemical/x-cml',
        csml: 'chemical/x-csml',
        xyz: 'chemical/x-xyz',
        bmp: 'image/bmp',
        cgm: 'image/cgm',
        g3: 'image/g3fax',
        gif: 'image/gif',
        ief: 'image/ief',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        jpe: 'image/jpeg',
        ktx: 'image/ktx',
        png: 'image/png',
        btif: 'image/prs.btif',
        sgi: 'image/sgi',
        svg: 'image/svg+xml',
        svgz: 'image/svg+xml',
        tiff: 'image/tiff',
        tif: 'image/tiff',
        psd: 'image/vnd.adobe.photoshop',
        uvi: 'image/vnd.dece.graphic',
        uvvi: 'image/vnd.dece.graphic',
        uvg: 'image/vnd.dece.graphic',
        uvvg: 'image/vnd.dece.graphic',
        sub: 'text/vnd.dvb.subtitle',
        djvu: 'image/vnd.djvu',
        djv: 'image/vnd.djvu',
        dwg: 'image/vnd.dwg',
        dxf: 'image/vnd.dxf',
        fbs: 'image/vnd.fastbidsheet',
        fpx: 'image/vnd.fpx',
        fst: 'image/vnd.fst',
        mmr: 'image/vnd.fujixerox.edmics-mmr',
        rlc: 'image/vnd.fujixerox.edmics-rlc',
        mdi: 'image/vnd.ms-modi',
        wdp: 'image/vnd.ms-photo',
        npx: 'image/vnd.net-fpx',
        wbmp: 'image/vnd.wap.wbmp',
        xif: 'image/vnd.xiff',
        webp: 'image/webp',
        '3ds': 'image/x-3ds',
        ras: 'image/x-cmu-raster',
        cmx: 'image/x-cmx',
        fh: 'image/x-freehand',
        fhc: 'image/x-freehand',
        fh4: 'image/x-freehand',
        fh5: 'image/x-freehand',
        fh7: 'image/x-freehand',
        ico: 'image/x-icon',
        sid: 'image/x-mrsid-image',
        pcx: 'image/x-pcx',
        pic: 'image/x-pict',
        pct: 'image/x-pict',
        pnm: 'image/x-portable-anymap',
        pbm: 'image/x-portable-bitmap',
        pgm: 'image/x-portable-graymap',
        ppm: 'image/x-portable-pixmap',
        rgb: 'image/x-rgb',
        tga: 'image/x-tga',
        xbm: 'image/x-xbitmap',
        xpm: 'image/x-xpixmap',
        xwd: 'image/x-xwindowdump',
        eml: 'message/rfc822',
        mime: 'message/rfc822',
        igs: 'model/iges',
        iges: 'model/iges',
        msh: 'model/mesh',
        mesh: 'model/mesh',
        silo: 'model/mesh',
        dae: 'model/vnd.collada+xml',
        dwf: 'model/vnd.dwf',
        gdl: 'model/vnd.gdl',
        gtw: 'model/vnd.gtw',
        mts: 'model/vnd.mts',
        vtu: 'model/vnd.vtu',
        wrl: 'model/vrml',
        vrml: 'model/vrml',
        x3db: 'model/x3d+binary',
        x3dbz: 'model/x3d+binary',
        x3dv: 'model/x3d+vrml',
        x3dvz: 'model/x3d+vrml',
        x3d: 'model/x3d+xml',
        x3dz: 'model/x3d+xml',
        appcache: 'text/cache-manifest',
        ics: 'text/calendar',
        ifb: 'text/calendar',
        css: 'text/css',
        csv: 'text/csv',
        html: 'text/html',
        htm: 'text/html',
        n3: 'text/n3',
        txt: 'text/plain',
        text: 'text/plain',
        conf: 'text/plain',
        def: 'text/plain',
        list: 'text/plain',
        log: 'text/plain',
        in: 'text/plain',
        dsc: 'text/prs.lines.tag',
        rtx: 'text/richtext',
        sgml: 'text/sgml',
        sgm: 'text/sgml',
        tsv: 'text/tab-separated-values',
        t: 'text/troff',
        tr: 'text/troff',
        roff: 'text/troff',
        man: 'text/troff',
        me: 'text/troff',
        ms: 'text/troff',
        ttl: 'text/turtle',
        uri: 'text/uri-list',
        uris: 'text/uri-list',
        urls: 'text/uri-list',
        vcard: 'text/vcard',
        curl: 'text/vnd.curl',
        dcurl: 'text/vnd.curl.dcurl',
        scurl: 'text/vnd.curl.scurl',
        mcurl: 'text/vnd.curl.mcurl',
        fly: 'text/vnd.fly',
        flx: 'text/vnd.fmi.flexstor',
        gv: 'text/vnd.graphviz',
        '3dml': 'text/vnd.in3d.3dml',
        spot: 'text/vnd.in3d.spot',
        jad: 'text/vnd.sun.j2me.app-descriptor',
        wml: 'text/vnd.wap.wml',
        wmls: 'text/vnd.wap.wmlscript',
        s: 'text/x-asm',
        asm: 'text/x-asm',
        c: 'text/x-c',
        cc: 'text/x-c',
        cxx: 'text/x-c',
        cpp: 'text/x-c',
        h: 'text/x-c',
        hh: 'text/x-c',
        dic: 'text/x-c',
        f: 'text/x-fortran',
        for: 'text/x-fortran',
        f77: 'text/x-fortran',
        f90: 'text/x-fortran',
        java: 'text/x-java-source',
        opml: 'text/x-opml',
        p: 'text/x-pascal',
        pas: 'text/x-pascal',
        nfo: 'text/x-nfo',
        etx: 'text/x-setext',
        sfv: 'text/x-sfv',
        uu: 'text/x-uuencode',
        vcs: 'text/x-vcalendar',
        vcf: 'text/x-vcard',
        '3gp': 'video/3gpp',
        '3g2': 'video/3gpp2',
        h261: 'video/h261',
        h263: 'video/h263',
        h264: 'video/h264',
        jpgv: 'video/jpeg',
        jpm: 'video/jpm',
        jpgm: 'video/jpm',
        mj2: 'video/mj2',
        mjp2: 'video/mj2',
        mp4: 'video/mp4',
        mp4v: 'video/mp4',
        mpg4: 'video/mp4',
        mpeg: 'video/mpeg',
        mpg: 'video/mpeg',
        mpe: 'video/mpeg',
        m1v: 'video/mpeg',
        m2v: 'video/mpeg',
        ogv: 'video/ogg',
        qt: 'video/quicktime',
        mov: 'video/quicktime',
        uvh: 'video/vnd.dece.hd',
        uvvh: 'video/vnd.dece.hd',
        uvm: 'video/vnd.dece.mobile',
        uvvm: 'video/vnd.dece.mobile',
        uvp: 'video/vnd.dece.pd',
        uvvp: 'video/vnd.dece.pd',
        uvs: 'video/vnd.dece.sd',
        uvvs: 'video/vnd.dece.sd',
        uvv: 'video/vnd.dece.video',
        uvvv: 'video/vnd.dece.video',
        dvb: 'video/vnd.dvb.file',
        fvt: 'video/vnd.fvt',
        mxu: 'video/vnd.mpegurl',
        m4u: 'video/vnd.mpegurl',
        pyv: 'video/vnd.ms-playready.media.pyv',
        uvu: 'video/vnd.uvvu.mp4',
        uvvu: 'video/vnd.uvvu.mp4',
        viv: 'video/vnd.vivo',
        webm: 'video/webm',
        f4v: 'video/x-f4v',
        fli: 'video/x-fli',
        flv: 'video/x-flv',
        m4v: 'video/x-m4v',
        mkv: 'video/x-matroska',
        mk3d: 'video/x-matroska',
        mks: 'video/x-matroska',
        mng: 'video/x-mng',
        asf: 'video/x-ms-asf',
        asx: 'video/x-ms-asf',
        vob: 'video/x-ms-vob',
        wm: 'video/x-ms-wm',
        wmv: 'video/x-ms-wmv',
        wmx: 'video/x-ms-wmx',
        wvx: 'video/x-ms-wvx',
        avi: 'video/x-msvideo',
        movie: 'video/x-sgi-movie',
        smv: 'video/x-smv',
        ice: 'x-conference/x-cooltalk',
        vtt: 'text/vtt',
        crx: 'application/x-chrome-extension',
        htc: 'text/x-component',
        manifest: 'text/cache-manifest',
        buffer: 'application/octet-stream',
        m4p: 'application/mp4',
        m4a: 'audio/mp4',
        ts: 'video/MP2T',
        'event-stream': 'text/event-stream',
        webapp: 'application/x-web-app-manifest+json',
        lua: 'text/x-lua',
        luac: 'application/x-lua-bytecode',
        markdown: 'text/x-markdown',
        md: 'text/x-markdown',
        mkd: 'text/x-markdown',
        ini: 'text/plain',
        mdp: 'application/dash+xml'
    },
    util = require("./util");

/**
 * mime类型数组
 */
exports.mime = mime;

/**
 * 将对象转化成queryString
 * @param obj 要转化的对象
 * @param [sep] 连接符
 * @param [eq] 相等符号
 * @param [name] 符号的名字，如果obj不是Object类型，那么表示对一个字段进行组合
 * @returns {string}
 */
function encode(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
        obj = undefined;
    }
    if (typeof obj === 'object') {
        return Object.keys(obj).map(function (k) {
            var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
            if (Array.isArray(obj[k])) {
                return obj[k].map(function (v) {
                    return ks + encodeURIComponent(stringifyPrimitive(v));
                }).join(sep);
            } else {
                return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
            }
        }).join(sep);
    }
    if (!name) {
        return '';
    }
    return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
}
exports.encode = encode;

/**
 * 将queryString转化成对象
 * @param qs qs字符串
 * @param [sep] 连接符
 * @param [eq] 相等符号
 * @returns {{}}
 */
function decode(qs, sep, eq) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};
    if (typeof qs !== 'string' || qs.length === 0) {
        return obj;
    }
    var regexp = /\+/g;
    qs = qs.split(sep);
    var len = qs.length;
    for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, '%20'),
            idx = x.indexOf(eq),
            kstr, vstr, k, v;

        if (idx >= 0) {
            kstr = x.substr(0, idx);
            vstr = x.substr(idx + 1);
        } else {
            kstr = x;
            vstr = '';
        }
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
        if (!Object.prototype.hasOwnProperty.call(obj, k)) {
            obj[k] = v;
        } else if (Array.isArray(obj[k])) {
            obj[k].push(v);
        } else {
            obj[k] = [obj[k], v];
        }
    }
    return obj;
}
exports.decode = encode;


/**
 * 将url转换成对象
 * @param url
 * @returns {*}
 */
function parse(url) {
    if (typeof url !== 'string') {
        throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
    }
    var rest = url.trim(),
        proto = protocolPattern.exec(rest),
        i = 0,
        result = {};
    if (proto) {
        proto = proto[0];
        result.protocol = proto.toLowerCase();
        rest = rest.substr(proto.length);
    }
    var slashes = rest.substr(0, 2) === '//';
    if (slashes) {
        rest = rest.substr(2);
        result.slashes = true;
    }
    if (slashes || (proto && !slashedProtocol[proto])) {
        var hostEnd = -1;
        for (i = 0; i < hostEndingChars.length; i++) {
            var hec1 = rest.indexOf(hostEndingChars[i]);
            if (1 !== -1 && (hostEnd === -1 || hec1 < hostEnd)) {
                hostEnd = hec1;
            }
        }
        var auth, atSign;
        if (hostEnd === -1) {
            atSign = rest.lastIndexOf('@');
        } else {
            atSign = rest.lastIndexOf('@', hostEnd);
        }

        if (atSign !== -1) {
            auth = rest.slice(0, atSign);
            rest = rest.slice(atSign + 1);
            this.auth = decodeURIComponent(auth);
        }
        hostEnd = -1;
        for (i = 0; i < nonHostChars.length; i++) {
            var hec = rest.indexOf(nonHostChars[i]);
            if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
                hostEnd = hec;
            }
        }
        if (hostEnd === -1) {
            hostEnd = rest.length;
        }
        result.host = rest.slice(0, hostEnd);
        rest = rest.slice(hostEnd);
        var host = result.host;
        var port = portPattern.exec(host);
        if (port) {
            port = port[0];
            if (port !== ':') {
                result.port = port.substr(1);
            }
            host = host.substr(0, host.length - port.length);
        }
        if (host) {
            result.hostname = host;
        }
        result.hostname = result.hostname || '';
        var ipv6Hostname = result.hostname[0] === '[' && result.hostname[result.hostname.length - 1] === ']';
        if (!ipv6Hostname) {
            var hostparts = result.hostname.split(/\./);
            for (i = 0; i < hostparts.length; i++) {
                var part = hostparts[i];
                if (!part) {
                    continue;
                }
                if (!part.match(hostnamePartPattern)) {
                    var newpart = '';
                    for (var j = 0, k = part.length; j < k; j++) {
                        if (part.charCodeAt(j) > 127) {
                            newpart += 'x';
                        } else {
                            newpart += part[j];
                        }
                    }
                    if (!newpart.match(hostnamePartPattern)) {
                        var validParts = hostparts.slice(0, i);
                        var notHost = hostparts.slice(i + 1);
                        var bit = part.match(hostnamePartStart);
                        if (bit) {
                            validParts.push(bit[1]);
                            notHost.unshift(bit[2]);
                        }
                        if (notHost.length) {
                            rest = '/' + notHost.join('.') + rest;
                        }
                        result.hostname = validParts.join('.');
                        break;
                    }
                }
            }
        }
        if (result.hostname.length > hostnameMaxLen) {
            result.hostname = '';
        } else {
            result.hostname = result.hostname.toLowerCase();
        }
        if (!ipv6Hostname) {
            var domainArray = result.hostname.split('.');
            var newOut = [];
            for (i = 0; i < domainArray.length; ++i) {
                newOut.push(domainArray[i]);
            }
            result.hostname = newOut.join('.');
        }
        var p = result.port ? ':' + result.port : '';
        var h = result.hostname || '';
        result.host = h + p;
        result.href += result.host;
        if (ipv6Hostname) {
            result.hostname = result.hostname.substr(1, result.hostname.length - 2);
            if (rest[0] !== '/') {
                rest = '/' + rest;
            }
        }
    }
    for (i = 0; i < autoEscape.length; i++) {
        var ae = autoEscape[i];
        var esc = encodeURIComponent(ae);
        if (esc === ae) {
            esc = escape(ae);
        }
        rest = rest.split(ae).join(esc);
    }
    var hash = rest.indexOf('#');
    if (hash !== -1) {
        result.hash = rest.substr(hash);
        rest = rest.slice(0, hash);
    }
    var qm = rest.indexOf('?');
    if (qm !== -1) {
        result.search = rest.substr(qm);
        result.query = rest.substr(qm + 1);
        result.query = decode(result.query);
        rest = rest.slice(0, qm);
    } else {
        result.search = '';
        result.query = {};
    }
    if (rest) {
        result.pathname = rest;
    }
    if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
        result.pathname = '/';
    }
    if (result.pathname || result.search) {
        result.path = (result.pathname || '') + ( result.search || '');
    }
    result.href = format(result);
    return result;
}
exports.parse = parse;

/**
 * 从更正后的url对象中
 * @param result
 * @returns {*}
 */
function format(result) {
    var auth = result.auth || '';
    if (auth) {
        auth = encodeURIComponent(auth);
        auth = auth.replace(/%3A/i, ':');
        auth += '@';
    }
    var protocol = result.protocol || '',
        pathname = result.pathname || '',
        hash = result.hash || '',
        host = false,
        query = '';
    if (result.host) {
        host = auth + result.host;
    } else if (result.hostname) {
        host = auth + (result.hostname.indexOf(':') === -1 ? result.hostname : '[' + result.hostname + ']');
        if (result.port) {
            host += ':' + result.port;
        }
    }
    if (result.query && typeof result.query === 'object' && Object.keys(result.query).length) {
        query = encode(result.query);
    }
    var search = result.search || (query && ('?' + query)) || '';
    if (protocol && protocol.substr(-1) !== ':') {
        protocol += ':';
    }
    if (result.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
        host = '//' + (host || '');
        if (pathname && pathname.charAt(0) !== '/') {
            pathname = '/' + pathname;
        }
    } else if (!host) {
        host = '';
    }
    if (hash && hash.charAt(0) !== '#') {
        hash = '#' + hash;
    }
    if (search && search.charAt(0) !== '?') {
        search = '?' + search;
    }
    pathname = pathname.replace(/[?#]/g, function (match) {
        return encodeURIComponent(match);
    });
    search = search.replace('#', '%23');
    return protocol + host + pathname + search + hash;
}
exports.format = format;

/**
 * 添加主域名
 * @param h
 */
exports.host = function (h) {
    if (h[h.length] === "/") {
        host = h.slice(1);
    } else {
        host = h;
    }
};

/**
 * 发起一个jsonp请求
 * @param url 要请求的网址
 * @param [data] 额外发送的数据
 * @param success 成功回调
 * @param [error] 失败回调
 * @param [cbname] 回调函数字段
 */
function jsonp(url, data, success, error, cbname) {
    if (typeof data === "function") {
        cbname = error;
        error = success;
        success = data;
        data = null;
    }
    url = parse(url);
    if (!url.protocol) {
        url.protocol = "http:";
    }
    if (!url.host) {
        url.host = host;
    }
    if (url.search) {
        delete  url.search;
    }
    url.query = url.query || {};
    if (url.hash) {
        delete  url.hash;
    }
    var uuid = "callback" + util.uuid().replace("-", "");
    cbname = cbname || "callback";
    url.query[cbname] = uuid;
    util.merge(url.query, data || {});
    error = error || function (code, msg) {
        console.log("error: code=" + code + " message=" + msg);
    };
    var script = document.createElement("script");
    script.src = format(url);
    script.async = true;
    script.charset = "utf-8";
    script.onload = function () {
        document.head.removeChild(script);
        if (uuid in window) {
            delete window[uuid];
            error(500, "错误的jsonp格式");
        }
    };
    script.onerror = function (evt) {
        document.head.removeChild(script);
        error(evt.type === "error" ? 404 : 200, evt.type);
    };
    window[uuid] = function (data) {
        delete window[uuid];
        success(data);
    };
    document.head.appendChild(script);
}
exports.jsonp = jsonp;


/**
 * 发起一个ajax请求
 * @param url 要请求的网址
 * @param data 额外发送的数据
 * @param success 成功回调
 * @param [error] 失败回调
 * @param [options] 配置参数
 */
function ajax(url, data, success, error, options) {
    if (typeof data === "function") {
        options = error;
        error = success;
        success = data;
        data = null;
    }
    url = parse(url);
    if (!url.protocol) {
        url.protocol = "http:";
    }
    if (!url.host) {
        url.host = host;
    }
    if (url.search) {
        delete  url.search;
    }
    url.query = url.query || {};
    url.query["_"] = util.uuid();
    if (url.hash) {
        delete  url.hash;
    }
    var type = (options.type || "GET").toUpperCase();
    if (type === "GET") {
        util.merge(url.query, data || {});
        data = null;
    }
    url = format(url);
    var async = options.async || true;
    var username = options.username || null;
    var password = options.password || null;
    var headers = options.headers || {};
    var timeout = options.timeout || 0;
    var responseType = options.responseType || "text";
    error = error || function (code, msg) {
        console.log("error: code=" + code + " message=" + msg);
    };
    if (window.devProxy) {
        headers["X-Forwarded-For"] = url;
        url = window.devProxy;
    }
    var cookie = options.cookie;
    if (cookie) {
        var carr = "";
        for (var x in cookie) {
            if (cookie.hasOwnProperty(x) && cookie[x]) {
                carr += x + "=" + cookie[x] + "; ";
            }
        }
        headers["Cookie"] = carr;
    }
    var xhr = null;
    try {
        xhr = new XMLHttpRequest();
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/xml");
        }
    } catch (e) {
        error("404", "无法创建XMLHttpRequest对象！");
    }
    xhr.open(type, url, async, username, password);
    if (!headers["X-Requested-With"]) {
        headers["X-Requested-With"] = "XMLHttpRequest";
    }
    for (var i in headers) {
        if (headers.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, headers[ i ]);
        }
    }
    xhr.onload = function () {
        var status = xhrSuccessStatus[ xhr.status ] || xhr.status;
        var msg = xhr.statusText;
        var sheader = xhr.getAllResponseHeaders() || "";
        var responseHeaders = {};
        var match;
        while ((match = rheaders.exec(sheader))) {
            var key = match[1].toLowerCase();
            var value = match[ 2 ];
            if (key === "set-cookie") {
                responseHeaders["set-cookie"] = responseHeaders["set-cookie"] || [];
                responseHeaders["set-cookie"].push(value);
                if (cookie) {
                    var str = value.split(";")[0];
                    var arr = str.split("=");
                    cookie[arr[0].trim()] = arr[1].trim();
                }
            } else {
                responseHeaders[ key ] = value;
            }
        }
        if (responseType === "buffer") {
            success(xhr.response, status, msg, responseHeaders);
        } else if (responseType === "json" && xhr.responseText) {
            success(JSON.parse(xhr.responseText), status, msg, responseHeaders);
        } else if (responseType === "xml" && xhr.responseText) {
            var parser = new DOMParser();
            success(parser.parseFromString(xhr.responseText, "text/xml"), status, msg, responseHeaders);
        } else {
            success(xhr.responseText, status, msg, responseHeaders);
        }
    };
    if (timeout) {
        xhr.timeout = timeout;
        xhr.ontimeout = function () {
            error(xhr.status || 404, "请求时间过长！");
        };
    }
    xhr.onerror = function () {
        error(xhr.status || 404, xhr.statusText || "请求的文件不存在！");
    };
    try {
        if (data instanceof FormData) {
            xhr.send(data);
        }
        else {
            xhr.send(encode(data) || null);
        }
    } catch (e) {
        error(xhr.status || 404, xhr.statusText || "发送数据错误");
    }
}
exports.ajax = ajax;

/**
 * 通过get请求获取数据
 * @param url {string} 要请求的URL
 * @param [data] {{}} 请求的数据
 * @param [success] 成功回调
 * @param [error] 失败回调
 * @param [type] 返回数据类型
 */
exports.get = function (url, data, success, error, type) {
    ajax(url, data, success, error, { responseType: type});
};

/**
 * 通过POST方式获取数据
 * @param url {string} 要请求的URL
 * @param [data] {{}} 请求的数据（请注意此方式可以添加FormData类型数据）
 * @param [success] 成功回调
 * @param [error] 失败回调
 * @param [type] 返回数据类型
 */
exports.post = function (url, data, success, error, type) {
    ajax(url, data, success, error, {type: "post", responseType: type});
};


/**
 * 添加特殊的协议
 * @note 如定义baidu = http://www.baidu.com，则baidu://a/b为会替换为http://www.baidu.com/a/b
 * @param type {string|*} 类型
 * @param [target]
 */
exports.setProtocol = function (type, target) {
    type = typeof type !== 'string' ? type : {type: target};
    for (var x in type) {
        if (type.hasOwnProperty(x)) {
            if (x.indexOf(":") < 0) {
                protocols[x.toLowerCase() + ":"] = target;
            }
            else {
                protocols[x.toLowerCase()] = target;
            }
        }
    }
};

/**
 * 通过特殊协议定制的方式获取数据
 * @param url {string} 要请求的URL
 * @param [data] {{}} 请求的数据（请注意此方式可以添加FormData类型数据）
 * @param success 成功回调
 * @param [error] 失败回调
 * @param [options] 其它参数
 */
exports.protocol = function (url, data, success, error, options) {
    if (typeof data === "function") {
        options = error;
        error = success;
        success = data;
        data = null;
    }
    options = options || {};
    var rest = url.trim();
    var flag = false;
    var proto = protocolPattern.exec(rest);
    if (proto) {
        proto = proto[0].toLowerCase();
        rest = rest.substr(proto.length + 2);
        for (var x in protocols) {
            if (protocols.hasOwnProperty(x) && x === proto) {
                flag = true;
                var result = "";
                var target = protocols[x].url;
                if (target[target.length - 1] === "/") {
                    result += target.url.slice(0, -1);
                } else {
                    result += target.url;
                }
                result += "/";
                if (rest[0] === "/") {
                    result += rest.slice(1);
                } else {
                    result += rest;
                }
                url = result;
                options = util.merge({}, protocols[x], true);
                delete  options[url];
                ajax(url, data, success, error, options);
                return;
            }
        }
    }
    ajax(url, data, success, error, options);
};

/**
 * 对部分系统定义类型进行转换
 * @param v 数据
 * @returns {*}
 */
function stringifyPrimitive(v) {
    switch (typeof v) {
        case 'string':
            return v;

        case 'boolean':
            return v ? 'true' : 'false';

        case 'number':
            return isFinite(v) ? v : '';

        default:
            return '';
    }
}
